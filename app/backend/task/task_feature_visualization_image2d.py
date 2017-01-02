#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json
import os
import shutil
from datetime import datetime

from sklearn.manifold import TSNE
from sklearn.decomposition import PCA

import numpy as np
import pandas as pd
import sklearn
from sklearn.metrics import roc_auc_score

from app.backend.core import utils as dlsutils
from app.backend.core.models.api import modelsWatcher

from task import Task

import keras
from keras import backend as K

from app.backend.main.dataset.api import datasetWatcher
from app.backend.core.models.keras_trainer_v4 import KerasTrainer as ModelProcessor
from app.backend.core.models.cfg import PREFIX_EVAL_ROC_DIR, CFG_EVAL_ROC, PREFIX_EVAL_ROC_TABLE, PREFIX_FSPACE_DIR, PREFIX_FSPACE_FSP
from app.backend.core import utils as dlsutils

class TaskFeatureSpaceVisImage2D(Task):
    modelId=None
    datasetId=None
    def __init__(self, configJson):
        # (1) Task-constructor:
        Task.__init__(self)
        # (2) Configure params:
        self.modelId    = configJson['model-id']
        self.datasetId  = configJson['dataset-id']
        # (3) Ext. analysis params: PCA + t-SNE
        try:
            self.numSamples = int(configJson['samples'])
        except:
            self.logger.error('Invalid parameter #Samples [%s]' % configJson['samples'])
        self.isPCA  = False
        self.isTSNE = False
        try:
            self.isPCA = configJson['is-pca']
        except:# Exception as err:
            self.logger.error('PCA analysis flag is not defined explicitly, set to [%s]' % self.isPCA)
        try:
            self.isTSNE = configJson['is-tsne']
        except:# Exception as err:
            self.logger.error('t-SNE analysis flag is not defined explicitly, set to [%s]' % self.isTSNE)
        #
        self.text   = 'Feature Space Visualization: Image2D Cls'
        self.type   = 'fspace-image2d'
        self.basetype = 'model'
    def perform(self):
        self.progress=0
        # (1) Check input parameters
        self.logger.info('Check input parameters model=[%s] db=[%s]' % (self.modelId, self.datasetId))
        if self.modelId not in modelsWatcher.dictModelsInfo.keys():
            self.logger.error('Unknown model ID [%s]' % self.modelId)
            self.state = 'error'
            self.alive = False
            return
        if self.datasetId not in datasetWatcher.dictDbInfo.keys():
            self.logger.error('Unknown dataset ID [%s]' % self.datasetId)
            self.state = 'error'
            self.alive = False
            return
        modelInfo = modelsWatcher.dictModelsInfo[self.modelId]
        dbInfo = datasetWatcher.dictDbInfo[self.datasetId]
        # (2) Load and initialise trained model
        self.logger.info('Load and initialise trained model [%s]' % self.modelId)
        modelProcessor = ModelProcessor()
        modelProcessor.loadModelFromTrainingStateInDir(modelInfo.dirModel)
        # (3) Check #Classes in Dataset and Model
        self.logger.info('Check #Classes in Model and Dataset')
        numLabelsDb = len(dbInfo.labels)
        numLabelsModel = len(modelProcessor.batcherLMDB.lbl)
        if numLabelsDb != numLabelsModel:
            self.logger.error('The number of classes in Model [%d] and Dataset [%d] must been equals!' % (numLabelsModel, numLabelsDb))
            self.state = 'error'
            self.alive = False
            return
        # (4) Prepare directory for ROC-Analysis results
        fspaceId = dlsutils.getUniqueTaskId(PREFIX_FSPACE_DIR)
        self.logger.info('Prepare directory for Feature Space analysis id=[%s]' % fspaceId)
        dirFSpace = os.path.join(modelInfo.dirModel, fspaceId)
        dlsutils.makeDirIfNotExists(dirFSpace)
        # (5) Initialyze counter for progress calculation
        dbTypes = dbInfo.dbIndex.keys()
        # numTotalIter = len(dbTypes)*self.numSamples
        # numTotalIterInBase = dbInfo.getInfoStat()['info']['numTotal']
        # if numTotalIterInBase<numTotalIter:
        #     numTotalIter = numTotalIterInBase-1
        # if numTotalIter < 1:
        #     numTotalIter = 1
        counter = 0
        # (6) Iterate over dataset-type (train and val)
        lstLayersRes = []
        lstLayersFun = []
        lstLayersNms = []
        lstLayersInp = []
        for ii,ll in enumerate(modelProcessor.model.layers):
            isAddLayer = False
            if isinstance(ll, keras.layers.InputLayer):
                isAddLayer = True
                lstLayersInp.append(ll.input)
            elif isinstance(ll, keras.layers.Convolution2D):
                isAddLayer = True
            elif isinstance(ll, keras.layers.Dense):
                #FIXME: we do not want include 'Output' layer, this is a stupid, temporary hack
                if ll.activation.func_name!='softmax':
                    isAddLayer = True
            if isAddLayer:
                lstLayersRes.append((ii, ll))
                lstLayersFun.append(ll.output)
                lstLayersNms.append(ll.name)
        numTotalIter = 1 + len(lstLayersNms)*len(dbTypes)
        featuresNN = K.function(lstLayersInp, lstLayersFun)
        rocResult = {}
        dataForLayers = {xx:None for xx in lstLayersNms}
        #FIXME: DB-Type is a different for 'train' and 'val'
        for dbi, dbType in enumerate(dbTypes[:1]):
            self.logger.info('Build Feature Space for sub-set: [%s]' % dbType)
            tnumSamplesInDB = len(dbInfo.dbIndex[dbType]['keys'])
            tnumSamples = self.numSamples
            if tnumSamples > tnumSamplesInDB:
                tnumSamples = tnumSamplesInDB
            trndIdx = np.random.permutation(range(tnumSamplesInDB))[:tnumSamples]
            tkeys = dbInfo.dbIndex[dbType]['keys'][trndIdx]
            tlabels = dbInfo.dbIndex[dbType]['lblid'][trndIdx]
            for imgId, imgStrId in enumerate(tkeys):
                timg = dbInfo.getRawImageFromDB(dbType, trndIdx[imgId], isNumpyArray=True)
                tdataX = modelProcessor.convertImgUint8ToDBImage(timg)
                tdataX = tdataX.reshape([1] + list(tdataX.shape))
                tret = featuresNN([tdataX])
                for idxL,tlname in enumerate(lstLayersNms):
                    tdsc = tret[idxL].reshape(-1)
                    if dataForLayers[tlname] is None:
                        dataForLayers[tlname] = np.zeros((tnumSamples, len(tdsc)))
                    dataForLayers[tlname][imgId,:] = tdsc
            dataForLayersRet=[]
            for kk,vv in dataForLayers.items():
                tmpRet = {
                    'name': kk,
                }
                tdata = {}
                if self.isPCA:
                    pca = PCA(n_components=2)
                    dscPCA = pca.fit_transform(vv)
                    tmpDsc = {}
                    for cci,ccn in enumerate(dbInfo.labels):
                        tmpDsc[ccn] = {
                            'x': dscPCA[tlabels==cci, 0].tolist(),
                            'y': dscPCA[tlabels==cci, 1].tolist(),
                        }
                    tdata['pca'] = tmpDsc
                if self.isTSNE:
                    tsne = TSNE(n_components=2, init='pca', metric='l2')
                    dscTSNE = tsne.fit_transform(vv)
                    tmpDsc = {}
                    for cci, ccn in enumerate(dbInfo.labels):
                        tmpDsc[ccn] = {
                            'x': dscTSNE[tlabels == cci, 0].tolist(),
                            'y': dscTSNE[tlabels == cci, 1].tolist(),
                        }
                    tdata['tsne'] = tmpDsc
                tmpRet['data'] = tdata
                dataForLayersRet.append(tmpRet)
                tfout = os.path.join(dirFSpace, '%s-%s.json' % (PREFIX_FSPACE_FSP, dbType))
                with open(tfout,'w') as ff:
                    ff.write(json.dumps(dataForLayersRet, indent=4))
        #
        self.logger.info('Refresh info about models in ModelsWatcher')
        modelsWatcher.refreshModelsInfo()
        self.progress=100
        self.state = 'finished'
        self.alive=False

    # while self.alive:
    #     time.sleep(2)
    #     self.progress += 10
    #     self.rows.append({'c': [{'v': self.progress}, {'v': random.random()}, {'v': random.random()}]})
    #     if self.progress>=100:
    #         self.state='finished'
    #         self.alive=False

if __name__ == '__main__':
    cfgJson = {
        'model-id':     'mdltask-20161211-203057-599375',
        'dataset-id':   'dbset-20160922-220218-011462',
        'is-pca':       True,
        'is-tsne':      False,
        'samples':      1000
    }
    testTask = TaskFeatureSpaceVisImage2D(cfgJson)
    testTask.perform()