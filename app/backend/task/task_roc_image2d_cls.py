#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json
import os
import shutil
from datetime import datetime

import numpy as np
import pandas as pd
import sklearn
from sklearn.metrics import roc_auc_score

from app.backend.core import utils as dlsutils
from app.backend.core.models.api import modelsWatcher

#from app.backend.core.models.cfg import PREFIX_EVAL_ROC_DIR, CFG_EVAL_ROC, PREFIX_EVAL_ROC_TABLE
#from app.backend.core.models.keras_trainer_v3 import KerasTrainer as ModelProcessor
#from app.backend.datasets.api import datasetWatcher
from task import Task

from app.backend.main.dataset.api import datasetWatcher
from app.backend.core.models.keras_trainer_v4 import KerasTrainer as ModelProcessor
from app.backend.core.models.cfg import PREFIX_EVAL_ROC_DIR, CFG_EVAL_ROC, PREFIX_EVAL_ROC_TABLE, PREFIX_EVAL_ROC_ROC
from app.backend.core import utils as dlsutils

class TaskROCImage2DCls(Task):
    modelId=None
    datasetId=None
    def __init__(self, configJson):
        # (1) Task-constructor:
        Task.__init__(self)
        # (2) Configure params:
        self.modelId    = configJson['model-id']
        self.datasetId  = configJson['dataset-id']
        # (3) Ext. analysis params: PCA + t-SNE
        self.isPCA = False
        try:
            self.isPCA = configJson['is-pca']
        except:# Exception as err:
            self.logger.error('PCA analysis flag is not defined explicitly, set to [%s]' % self.isPCA)
        self.isTSNE = False
        try:
            self.isTSNE = configJson['is-tsne']
        except:# Exception as err:
            self.logger.error('t-SNE analysis flag is not defined explicitly, set to [%s]' % self.isTSNE)
        #
        self.text   = 'ROC Analysis: Image2D Cls'
        self.type   = 'roc-image2d-cls'
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
        evalId = dlsutils.getUniqueTaskId(PREFIX_EVAL_ROC_DIR)
        self.logger.info('Prepare directory for ROC-Analysis results id=[%s]' % evalId)
        dirEvalROC = os.path.join(modelInfo.dirModel, evalId)
        dlsutils.makeDirIfNotExists(dirEvalROC)
        # (5) Initialyze counter for progress calculation
        numTotalIter = dbInfo.getInfoStat()['info']['numTotal']
        if numTotalIter < 1:
            numTotalIter = 1
        counter = 0
        # (6) Iterate over dataset-type (train and val)
        dbTypes = dbInfo.dbIndex.keys()
        rocResult = {}
        for dbi, dbType in enumerate(dbTypes):
            self.logger.info('Calc ROC for sub-set: [%s]' % dbType)
            tdataIndex = dbInfo.dbIndex[dbType]
            tnumImages = len(tdataIndex['keys'])
            tnumLabels = len(dbInfo.labels)
            arrProb = np.zeros((tnumImages, tnumLabels))
            for imgId, imgStrId in enumerate(tdataIndex['keys']):
                timg = dbInfo.getRawImageFromDB(dbType, imgId, isNumpyArray=True)
                tret = modelProcessor.inferOneImageU8(timg)
                arrProb[imgId, :] = tret['prob'][0]
                counter+=1
                self.progress = int((100*counter)/numTotalIter)
                #FIXME: check this code
                if not self.alive:
                    if os.path.isdir(dirEvalROC):
                        shutil.rmtree(dirEvalROC)
                    return
            #
            csvDataLabels = pd.DataFrame(tdataIndex['lblid'], columns=['labelid'])
            csvDataProb = pd.DataFrame(arrProb, columns=dbInfo.labels)
            csvData = csvDataLabels.join(csvDataProb)
            foutTableCSV = os.path.join(dirEvalROC, '%s_%s.csv' % (PREFIX_EVAL_ROC_TABLE, dbType))
            csvData.to_csv(foutTableCSV, index=None)
            #
            tmpListROCs = []
            for clsId, clsName in enumerate(dbInfo.labels):
                fpr, tpr, thresholds = sklearn.metrics.roc_curve(tdataIndex['lblid'], arrProb[:, clsId], pos_label=clsId)
                rocScore = roc_auc_score(tdataIndex['lblid'] == clsId, arrProb[:, clsId])
                self.logger.info('[%s] AUC score for class [%s] is %0.3f' % (dbType, clsName, rocScore))
                tmpClsROC = {
                    'name': clsName,
                    'auc': rocScore,
                    'rocPoints': [{'x': xx, 'y': yy} for xx, yy in zip(fpr, tpr)]
                }
                tmpListROCs.append(tmpClsROC)
            rocResult[dbType] = tmpListROCs
        foutCfg = os.path.join(dirEvalROC, CFG_EVAL_ROC)
        tmpCfg = {
            'id': evalId,
            'model-id': modelInfo.getId(),
            'model-name': modelInfo.getName(),
            'dataset-id': dbInfo.getId(),
            'dataset-name': dbInfo.getName(),
            'dbtypes': dbTypes,
            'date': datetime.now().strftime('%Y.%m.%d-%H:%M:%S'),
            'roc': rocResult
        }
        with open(foutCfg, 'w') as f:
            f.write(json.dumps(tmpCfg, indent=4))
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
    pass