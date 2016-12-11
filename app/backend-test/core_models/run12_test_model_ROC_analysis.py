#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json
import os
from datetime import datetime

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import sklearn
from sklearn.metrics import roc_auc_score

import app.backend.core.utils as dlsutils
from app.backend.core.models.api import modelsWatcher
from app.backend.core.models.cfg import PREFIX_EVAL_ROC_DIR, CFG_EVAL_ROC, PREFIX_EVAL_ROC_TABLE
from app.backend.core.models.keras_trainer_v3 import KerasTrainer as ModelProcessor
from app.backend.datasets.api import datasetWatcher

dirWithImages='../../../data-test/test-inference'

if __name__ == '__main__':
    print ('Models:')
    for kk,vv in modelsWatcher.dictModelsInfo.items():
        print ('[%s] : %s' % (kk, vv))
    print ('Datasets:')
    for kk, vv in datasetWatcher.dictDbInfo.items():
        print ('[%s] : %s' % (kk, vv))
    for dbInfo in datasetWatcher.dictDbInfo.values():
        for modelInfo in modelsWatcher.dictModelsInfo.values():
            # dbInfo = datasetWatcher.dictDbInfo.values()[0]
            # modelInfo = modelsWatcher.dictModelsInfo.values()[0]
            print ('Selected Dataset: [%s]' % dbInfo)
            print ('Selected Model: [%s]' % modelInfo)
            print ('------------------')
            # (1) Load and initialise trained model
            modelProcessor = ModelProcessor()
            modelProcessor.loadModelFromTrainingStateInDir(modelInfo.dirModel)
            numLabelsDb     = len(dbInfo.labels)
            numLabelsModel  = len(modelProcessor.batcherLMDB.lbl)
            if numLabelsDb != numLabelsModel:
                continue
                # raise Exception('The number of model labels (%d) must be equal number of dataset labels (%d)' % (numLabelsDb, numLabelsModel))
            # (2) Prepare directory with output
            evalId = dlsutils.getUniqueTaskId(PREFIX_EVAL_ROC_DIR)
            dirEvalROC = os.path.join(modelInfo.dirModel, evalId)
            dlsutils.makeDirIfNotExists(dirEvalROC)
            # (4) Iterate over dataset-type (train and val)
            dbTypes = dbInfo.dbIndex.keys()
            plt.figure()
            lstLegend=[]
            rocResult={}
            for dbi,dbType in enumerate(dbTypes):
                tdataIndex = dbInfo.dbIndex[dbType]
                tnumImages = len(tdataIndex['keys'])
                tnumLabels = len(dbInfo.labels)
                arrProb = np.zeros((tnumImages, tnumLabels))
                for imgId,imgStrId in enumerate(tdataIndex['keys']):
                    timg = dbInfo.getRawImageFromDB(dbType, imgId, isNumpyArray=True)
                    tret = modelProcessor.inferOneImageU8(timg)
                    arrProb[imgId, :] = tret['prob'][0]
                    if (imgId%20)==0:
                        print ('\t[%d/%d] : db=%s/mdl=%s' % (imgId, tnumImages, dbInfo, modelInfo))
                #
                csvDataLabels = pd.DataFrame(tdataIndex['lblid'], columns=['labelid'])
                csvDataProb   = pd.DataFrame(arrProb, columns=dbInfo.labels)
                csvData       = csvDataLabels.join(csvDataProb)
                foutTableCSV  = os.path.join(dirEvalROC, '%s_%s.csv' % (PREFIX_EVAL_ROC_TABLE, dbType) )
                csvData.to_csv(foutTableCSV, index=None)
                #
                tmpListROCs=[]
                for clsId,clsName in enumerate(dbInfo.labels):
                    fpr, tpr, thresholds = sklearn.metrics.roc_curve(tdataIndex['lblid'], arrProb[:, clsId], pos_label=clsId)
                    rocScore = roc_auc_score(tdataIndex['lblid']==clsId, arrProb[:, clsId])
                    tstr = '%s: Class=%s, AUC=%0.3f' % (dbType, clsName, rocScore)
                    lstLegend.append(tstr)
                    plt.plot(fpr, tpr)
                    #
                    tmpClsROC={
                        'name':      clsName,
                        'auc':       rocScore,
                        'rocPoints': [{'x': xx, 'y': yy} for xx,yy in zip(fpr,tpr)]
                    }
                    tmpListROCs.append(tmpClsROC)
                rocResult[dbType] = tmpListROCs
            plt.title('Model [%s] trained on: %s, modelId=%s' % (modelInfo.getName(), modelInfo.getInfo()['dataset-name'], modelInfo.getId()))
            plt.grid(True)
            plt.legend(lstLegend)
            # (5) Export ROC-config files in JSON:
            foutCfg = os.path.join(dirEvalROC, CFG_EVAL_ROC)
            tmpCfg = {
                'id':           evalId,
                'model-id':     modelInfo.getId(),
                'model-name':   modelInfo.getName(),
                'dataset-id':   dbInfo.getId(),
                'dataset-name': dbInfo.getName(),
                'dbtypes':      dbTypes,
                'date':         datetime.now().strftime('%Y.%m.%d-%H:%M:%S'),
                'roc':          rocResult
            }
            with open(foutCfg, 'w') as f:
                f.write(json.dumps(tmpCfg, indent=4))
    plt.show()
