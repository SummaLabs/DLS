#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import sys
import glob
import fnmatch
import numpy as np
import json
import lmdb
import matplotlib.pyplot as plt

import copy

import shutil
import skimage.io as skio

from dbhelpers import DBImageImportReader, DBImageImportReaderFromDir, DBImageImportReaderFromCSV, checkFilePath
from dbconfig import DBImage2DConfig
from imgproc2d import ImageTransformer2D

#################################################
class Progressor:
    counterMax=0
    counter=0
    strState=None
    def __init__(self, parCounterMax=100, parCounter=0, strState=None):
        self.counter    = parCounter
        self.counterMax = parCounterMax
        self.strState   = strState
    def getPercent(self):
        tdiv = self.counterMax
        if tdiv<1:
            tdiv = 1
        return (100*self.counter)/tdiv
    def inc(self):
        self.counter+=1
    def update(self):
        self.inc()
    def toString(self):
        tret = '[%d/%d] : %0.1f%% (%s)' % (self.counter, self.counterMax, self.getPercent(), self.strState)
        return tret
    def __str__(self):
        return self.toString()
    def __repr__(self):
        return self.toString()

#################################################
class DBImage2DBuilder:
    lmdbTrain   = 'train_db'
    lmdbVal     = 'val_db'
    fmeanData   = 'mean.binaryproto'
    fmeanImage  = 'mean.jpg'
    flabels     = 'labels.txt'
    fconfig     = 'cfg.json'
    #
    wdir        = None
    pathCfg     = None
    #
    cfg2D       = None
    imgReader2D = None
    #
    def getPathLmdbTrain(self):
        return os.path.join(self.wdir, self.lmdbTrain)
    def getPathLmdbVal(self):
        return os.path.join(self.wdir, self.lmdbVal)
    def getPathMeanBlob(self):
        return os.path.join(self.wdir, self.fmeanData)
    def getPathMeanImage(self):
        return os.path.join(self.wdir, self.fmeanImage)
    def getParhLabels(self):
        return os.path.join(self.wdir, self.flabels)
    def getPathDbConfig(self):
        return os.path.join(self.wdir, self.fconfig)
    #
    def isInitialized(self):
        return (self.cfg2D is not None) and (self.imgReader2D is not None)
    def __init__(self, pathCfgInp=None, pathDirOut=None):
        if pathCfgInp is not None:
            checkFilePath(pathCfgInp)
            self.pathCfg = pathCfgInp
        if pathDirOut is not None:
            checkFilePath(pathDirOut, isDirectory=True)
            self.wdir = pathDirOut
        if (self.wdir is not None) and (self.pathCfg is not None):
            pass
    def initializeInfo(self):
        self.cfg2D = DBImage2DConfig(self.pathCfg)
        tdatasetType = self.cfg2D.getImportDatasetType()
        if tdatasetType=='dir':
            self.imgReader2D = DBImageImportReaderFromDir(self.cfg2D)
        elif tdatasetType=='txt':
            self.imgReader2D = DBImageImportReaderFromCSV(self.cfg2D)
        else:
            raise Exception('Unknown dataset-import type: [%s]' % tdatasetType)
        self.imgReader2D.precalculateInfo()
    def toString(self):
        if self.isInitialized():
            tret = '[DBImage2DBuilder] : %s' % self.imgReader2D.toString()
            return tret
        else:
            "DBImage2DBuilder() is not initialized yet!"
    def __str__(self):
        return self.toString()
    def __repr__(self):
        return self.toString()
    def _buildLBDMForLists(self, pathLMDB, imageTransformer2D, listLabels, mapImgPaths, imageEncoding, progressor):
        tsizInBytes = 4 * (1024 ** 3)
        # (1) crate LMDB objet
        with lmdb.open(pathLMDB, map_size=tsizInBytes) as env:
            with env.begin(write=True) as  txn:
                for lidx, ll in enumerate(listLabels):
                    tlstPathImg = mapImgPaths[ll]
                    for pp in tlstPathImg:
                        timg = imageTransformer2D.processImageFromFile(pp, isReshapeFinal=True, isAccumulateMean=True)
                        datum = ImageTransformer2D.cvtImage2Datum(timg, imageEncoding, lidx)
                        str_id = '%12d' % progressor.counter
                        txn.put(str_id.encode('ascii'), datum.SerializeToString())
                        progressor.update()
                    print (progressor)
    def buildDataset(self, parProgressor=None):
        if self.isInitialized():
            timgEncoding = self.cfg2D.getImageEncoding()
            cntProgressMax  = self.imgReader2D.numTrainImages+self.imgReader2D.numValImages
            if parProgressor is None:
                progressor      = Progressor(parCounterMax=cntProgressMax)
            else:
                progressor = parProgressor
                progressor.counter = 0
                progressor.counterMax = cntProgressMax
            imageTransformer2D = ImageTransformer2D(self.cfg2D)
            tpathLmdbTrain  = self.getPathLmdbTrain()
            tpathLmdbVal    = self.getPathLmdbVal()
            if os.path.isdir(tpathLmdbTrain):
                print ('remove existing LMDB [%s] dir...' % tpathLmdbTrain)
                shutil.rmtree(tpathLmdbTrain)
            if os.path.isdir(tpathLmdbVal):
                print ('remove existing LMDB [%s] dir...' % tpathLmdbVal)
                shutil.rmtree(tpathLmdbVal)
            # (1) build Training DB
            progressor.strState = 'train-db'
            self._buildLBDMForLists(tpathLmdbTrain,
                                    imageTransformer2D,
                                    self.imgReader2D.listLabels,
                                    self.imgReader2D.listTrainPath,
                                    timgEncoding,
                                    progressor)
            # (2) build Validation DB
            progressor.strState = 'val-db'
            self._buildLBDMForLists(tpathLmdbVal,
                                    imageTransformer2D,
                                    self.imgReader2D.listLabels,
                                    self.imgReader2D.listValPath,
                                    timgEncoding,
                                    progressor)
            timgMeanBlob    = imageTransformer2D.getMeanImage(outType=np.float)
            timgMeanImage   = imageTransformer2D.getMeanImage()
            tpathMeanBlob   = self.getPathMeanBlob()
            tpathMeanImage  = self.getPathMeanImage()
            # (3) save mean binary-proto
            ImageTransformer2D.saveImage2BinaryBlob(timgMeanBlob, tpathMeanBlob)
            if timgMeanImage.shape[0]==1:
                timgMeanImage = timgMeanImage.reshape(tuple(timgMeanImage.shape[1:]))
            else:
                timgMeanImage = timgMeanImage.transpose((1,2,0))
            # (4) save mean preview image
            skio.imsave(tpathMeanImage, timgMeanImage)
            tpathLabels = self.getParhLabels()
            # (5) save labels to file
            with open(tpathLabels, 'w') as f:
                for ll in self.imgReader2D.listLabels:
                    f.write('%s\n' % ll)
            # (6) save DB-config
            tpathCfg = self.getPathDbConfig()
            newCfg = copy.copy(self.cfg2D.cfg)
            newCfg['dbType']='image2d'
            dbStats={
                'numLabels' : self.imgReader2D.numLabels,
                'numTrain'  : self.imgReader2D.numTrainImages,
                'numVal'    : self.imgReader2D.numValImages,
                'numTotal'  : (self.imgReader2D.numTrainImages + self.imgReader2D.numValImages)
            }
            newCfg['dbinfo'] = dbStats
            with open(tpathCfg,'w') as f:
                f.write(json.dumps(newCfg, indent=4))
        else:
            raise Exception("Cant build dataset, DBImage2DBuilder() is not initialized yet!")

#################################################
if __name__ == '__main__':
    pass