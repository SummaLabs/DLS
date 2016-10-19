#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import json
import shutil

import skimage.io as skio
import numpy as np
from datetime import datetime
import copy

from app.backend.core.datasets.api import datasetWatcher
from app.backend.core import utils as dlsutils
from app.backend.core.datasets.dbbuilder import DBImage2DBuilder, Progressor
from app.backend.core.datasets.imgproc2d import ImageTransformer2D
from task import Task
import random

class TaskDBImage2DBuilder(Task, DBImage2DBuilder):
    prefixDataset = 'dbset'
    def __init__(self, configJson):
        # (1) Task-constructor:
        Task.__init__(self)
        # (2) prepare db-directory with temporary saved config in Json format
        tdirDbId = dlsutils.getUniqueTaskId(self.prefixDataset)
        pathDatasets = dlsutils.getPathForDatasetDir()
        pathDirOut = os.path.abspath(os.path.join(pathDatasets, tdirDbId))
        dlsutils.makeDirIfNotExists(pathDirOut)
        pathCfgInp = os.path.join(pathDirOut, 'cfg-inp.json')
        with open(pathCfgInp, 'w') as f:
            f.write(json.dumps(configJson, indent=4))
        # (3) DBImage2DBuilder-constructor
        DBImage2DBuilder.__init__(self,pathCfgInp, pathDirOut)
        # self.initializeInfo()
        self.text   = 'Image2D DB Builder'
        self.type   = 'db-image2d-cls'
        self.basetype = 'dataset'
        self.icon = "/frontend/assets/icon/img/img-dataset1.png"
    def perform(self):
        self.initializeInfo()
        if self.isInitialized():
            timgEncoding = self.cfg2D.getImageEncoding()
            cntProgressMax = self.imgReader2D.numTrainImages + self.imgReader2D.numValImages
            self.logger.info('Total images: %d' % cntProgressMax)
            progressor = Progressor(parCounterMax=cntProgressMax)
            progressor.counter = 0
            progressor.counterMax = cntProgressMax
            # FIXME: i think it is a wrong code: fix in the future
            self.rows.append({'c': [{'v': self.progress}, {'v': random.random()}, {'v': random.random()}]})
            #
            imageTransformer2D = ImageTransformer2D(self.cfg2D)
            tpathLmdbTrain = self.getPathLmdbTrain()
            tpathLmdbVal = self.getPathLmdbVal()
            if os.path.isdir(tpathLmdbTrain):
                tstr = 'remove existing LMDB [%s] dir...' % tpathLmdbTrain
                self.logger.info(tstr)
                shutil.rmtree(tpathLmdbTrain)
            if os.path.isdir(tpathLmdbVal):
                tstr = 'remove existing LMDB [%s] dir...' % tpathLmdbVal
                self.logger.info(tstr)
                shutil.rmtree(tpathLmdbVal)
            # (1) build Training DB
            self.logger.info('build train dataset: %s' % tpathLmdbTrain)
            self._buildLBDMForLists(tpathLmdbTrain,
                                    imageTransformer2D,
                                    self.imgReader2D.listLabels,
                                    self.imgReader2D.listTrainPath,
                                    timgEncoding,
                                    progressor)
            # FIXME: i think it is a wrong code: fix in the future
            self.progress += (100*self.imgReader2D.numTrainImages)/cntProgressMax
            self.rows.append({'c': [{'v': self.progress}, {'v': random.random()}, {'v': random.random()}]})
            if not self.alive:
                return
            # (2) build Validation DB
            self.logger.info('build train dataset: %s' % tpathLmdbVal)
            self._buildLBDMForLists(tpathLmdbVal,
                                    imageTransformer2D,
                                    self.imgReader2D.listLabels,
                                    self.imgReader2D.listValPath,
                                    timgEncoding,
                                    progressor)
            # FIXME: i think it is a wrong code: fix in the future
            self.progress += (100*self.imgReader2D.numValImages)/cntProgressMax - 5
            self.rows.append({'c': [{'v': self.progress}, {'v': random.random()}, {'v': random.random()}]})
            if not self.alive:
                return
            timgMeanBlob = imageTransformer2D.getMeanImage(outType=np.float)
            timgMeanImage = imageTransformer2D.getMeanImage()
            tpathMeanBlob = self.getPathMeanBlob()
            tpathMeanImage = self.getPathMeanImage()
            # (3) save mean binary-proto
            self.logger.info('Prepare mean-image for train-dataset: %s' % tpathMeanImage)
            ImageTransformer2D.saveImage2BinaryBlob(timgMeanBlob, tpathMeanBlob)
            if timgMeanImage.shape[0] == 1:
                timgMeanImage = timgMeanImage.reshape(tuple(timgMeanImage.shape[1:]))
            else:
                timgMeanImage = timgMeanImage.transpose((1, 2, 0))
            # (4) save mean preview image
            skio.imsave(tpathMeanImage, timgMeanImage)
            tpathLabels = self.getParhLabels()
            # (5) save labels to file
            with open(tpathLabels, 'w') as f:
                tmp = self.imgReader2D.listLabels
                for ll in tmp:
                    f.write('%s\n' % ll)
            # (6) save DB-config
            tpathCfg = self.getPathDbConfig()
            newCfg = copy.copy(self.cfg2D.cfg)
            newCfg['dbType'] = 'image2d'
            tdateTime = datetime.now()
            strDate = tdateTime.strftime('%Y.%m.%d')
            strTime = tdateTime.strftime('%H:%M:%S')
            # prepare histograms
            tretLabels = self.imgReader2D.listLabels
            tretLabelHistTrain = [(ll, len(self.imgReader2D.listTrainPath[ll])) for ll in tretLabels]
            tretLabelHistVal = [(ll, len(self.imgReader2D.listValPath[ll])) for ll in tretLabels]
            # prepare date & time
            tretDate = {
                'str': strDate,
                'year': tdateTime.strftime('%Y'),
                'month': tdateTime.strftime('%m'),
                'day': tdateTime.strftime('%m')
            }
            tretTime = {
                'str': strTime,
                'hour': tdateTime.strftime('%H'),
                'min': tdateTime.strftime('%M'),
                'sec': tdateTime.strftime('%S'),
            }
            dbStats = {
                'numLabels': self.imgReader2D.numLabels,
                'numTrain': self.imgReader2D.numTrainImages,
                'numVal': self.imgReader2D.numValImages,
                'numTotal': (self.imgReader2D.numTrainImages + self.imgReader2D.numValImages),
                'date': tretDate,
                'time': tretTime
            }
            dbHists = {
                'labels': tretLabels,
                'histTrain': tretLabelHistTrain,
                'histVal': tretLabelHistVal
            }
            newCfg['dbinfo'] = dbStats
            newCfg['dbhist'] = dbHists
            with open(tpathCfg, 'w') as f:
                f.write(json.dumps(newCfg, indent=4))
            # generate preview
            ImageTransformer2D.generateImagePreview(tpathLmdbTrain, nr=3, nc=5, fdirOut=self.wdir)
            #
            #FIXME: i think it is a wrong code: fix in the future
            datasetWatcher.refreshDatasetsInfo()
            self.rows.append({'c': [{'v': self.progress}, {'v': random.random()}, {'v': random.random()}]})
            self.progress = 100
            self.state = 'finished'
            self.alive = False
        else:
            raise Exception("Cant build dataset, DBImage2DBuilder() is not initialized yet!")
        # while self.alive:
        #     time.sleep(2)
        #     self.progress += 10
        #     self.rows.append({'c': [{'v': self.progress}, {'v': random.random()}, {'v': random.random()}]})
        #     if self.progress>=100:
        #         self.state='finished'
        #         self.alive=False

    def detailed_status(self):
        stt = self.status()
        info = {}
        info['numLabels'] = self.imgReader2D.numLabels
        info['labels'] = self.imgReader2D.listLabels
        info['numTrain'] = self.imgReader2D.numTrainImages
        info['numVal'] = self.imgReader2D.numValImages
        info['name'] = self.cfg2D.cfg['datasetname']
        stt['info'] = info
        return stt

if __name__ == '__main__':
    pass