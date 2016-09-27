#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import json
import glob

from datetime import datetime
from functools import wraps

from app.backend.core import utils as dlsutils
from app.backend.core.models.cfg import CFG_MODEL, CFG_SOLVER, CFG_MODEL_TRAIN, PREFIX_SNAPSHOT, EXT_MODEL_WEIGHTS, PREFIX_TASKS_DIR

from flow_parser import DLSDesignerFlowsParser
from batcher_image2d import BatcherImage2DLMDB

from app.backend.core.datasets import api as dbapi

from ..utils import getDateTimeForConfig

####################################
class ModelTaskDirBuilder:
    @staticmethod
    def buildModelTrainTaskDir(cfgModel):
        #
        if not isinstance(cfgModel, dict):
            with open(cfgModel, 'r') as f:
                cfgModel = json.load(f)
        #
        modelParser = DLSDesignerFlowsParser(cfgModel)
        modelTrainer, solverConfig = modelParser.buildKerasTrainer()
        #
        taskId=dlsutils.getUniqueTaskId(PREFIX_TASKS_DIR)
        dirWithModels   = dlsutils.getPathForModelsDir()
        dirWithDatasets = dlsutils.getPathForDatasetDir()
        dirTaskOut = os.path.join(dirWithModels, taskId)
        #
        datasetId = solverConfig['dataset-id']
        dirDataset = os.path.join(dirWithDatasets, datasetId)
        dlsutils.makeDirIfNotExists(dirTaskOut)
        #
        modelAdjusted = modelTrainer.adjustModelInputOutput2DBData(modelTrainer.model, dirDataset)
        foutConfigModel  = os.path.join(dirTaskOut, CFG_MODEL_TRAIN)
        foutConfigSolver = os.path.join(dirTaskOut, CFG_SOLVER)
        foutConfig       = os.path.join(dirTaskOut, CFG_MODEL)
        with open(foutConfigModel, 'w') as f:
            f.write(modelAdjusted.to_json(sort_keys=True, indent=4, separators=(',', ': ')))
        with open(foutConfigSolver, 'w') as f:
            f.write(json.dumps(solverConfig, indent=4))
        # prepare basic model config
        tdateTime = getDateTimeForConfig()
        if datasetId in dbapi.datasetWatcher.dictDbInfo.keys():
            dbName = dbapi.datasetWatcher.dictDbInfo[datasetId].cfg.getDBName()
        else:
            dbName = 'Unknown DB-Name'
        modelConfig = {
            'id':           taskId,
            'dataset-id':   datasetId,
            'dataset-name': dbName,
            'date':         tdateTime['date'],
            'time':         tdateTime['time'],
            'type':         'image2d-classification',
            'name':         cfgModel['name'],
            'description':  cfgModel['description']
        }
        with open(foutConfig, 'w') as f:
            f.write(json.dumps(modelConfig, indent=4))

####################################
class ModelInfo:
    dirModel=None
    pathCfg=None
    pathModelCfg=None
    pathSolverCfg=None
    cfgDict=None
    # decorator for check init-state
    def checkInit(fun):
        @wraps(fun)
        def wrapped(inst, *args, **kwargs):
            if inst.isInitialized():
                return fun(inst, *args, **kwargs)
            else:
                inst.raiseErrorNotInitialized()
        return wrapped
    def __init__(self, dirModelTask):
        self.cleanState()
        self.dirModel = dirModelTask
        # self.loadModelInfoFromDir(dirModelTask)
    def cleanState(self):
        self.dirModel = None
        self.pathCfg = None
        self.pathModelCfg = None
        self.pathSolverCfg = None
        self.cfgDict = None
    def loadModelInfoById(self, modelId):
        dirWithModels = dlsutils.getPathForModelsDir()
        tdirModel = os.path.join(dirWithModels, modelId)
        self.loadModelInfoFromDir(tdirModel)
    def loadModelInfoFromDir(self, paramModelDir=None):
        if paramModelDir is not None:
            self.dirModel = paramModelDir
        dlsutils.checkFilePathNotFoundError(self.dirModel, isDir=True)
        #
        self.pathCfg       = os.path.join(self.dirModel, CFG_MODEL)
        self.pathModelCfg  = os.path.join(self.dirModel, CFG_MODEL_TRAIN)
        self.pathSolverCfg = os.path.join(self.dirModel, CFG_SOLVER)
        #
        dlsutils.checkFilePathNotFoundError(self.pathCfg)
        dlsutils.checkFilePathNotFoundError(self.pathModelCfg)
        dlsutils.checkFilePathNotFoundError(self.pathSolverCfg)
        #
        with open(self.pathCfg, 'r') as f:
            tmpCfg = json.load(f)
        with open(self.pathModelCfg, 'r') as f:
            tmpModelCfg = json.load(f)
        with open(self.pathSolverCfg, 'r') as f:
            tmpSolverCfg = json.load(f)
        listSnaphosts=glob.glob('%s/%s*.%s' % (self.dirModel, PREFIX_SNAPSHOT, EXT_MODEL_WEIGHTS))
        lstSnapshotsId=[os.path.splitext(os.path.basename(xx))[0] for xx in listSnaphosts]
        self.cfgDict = {
            'info':      tmpCfg,
            'solver':    tmpSolverCfg,
            'snapshots': lstSnapshotsId
        }
    def isInitialized(self):
        return (self.cfgDict is not None)
    def toString(self):
        if self.isInitialized():
            tstr = '%s (%s)' % (self.getName(), self.getId())
        else:
            tstr = 'ModelInfo is not initialized!'
        return tstr
    def __str__(self):
        return self.toString()
    def __repr__(self):
        return self.toString()
    #api
    @checkInit
    def getId(self):
        return self.cfgDict['info']['id']
    @checkInit
    def getName(self):
        return self.cfgDict['info']['name']
    @checkInit
    def getTraindedSnapshots(self):
        return self.cfgDict['snapshots']
    @checkInit
    def getConfig(self):
        return self.cfgDict
    @checkInit
    def getInfo(self):
        return self.cfgDict['info']
    @checkInit
    def getConfigJson(self):
        return json.dumps(self.cfgDict, indent=4)

class ModelsWatcher:
    dirModels       = None
    dictModelsInfo  = {}
    def __init__(self, pathDir=None):
        if pathDir is None:
            self.dirModels = dlsutils.getPathForModelsDir()
        else:
            self.dirModels = pathDir
    def refreshModelsInfo(self):
        if os.path.isdir(self.dirModels):
            self.dictModelsInfo = {}
            lstModelsDir = glob.glob('%s/mdltask-*' % self.dirModels)
            for ii, pp in enumerate(lstModelsDir):
                tmpModelInfo = ModelInfo(pp)
                try:
                    tmpModelInfo.loadModelInfoFromDir()
                    if tmpModelInfo.isInitialized():
                        self.dictModelsInfo[tmpModelInfo.getId()] = tmpModelInfo
                except Exception as err:
                    print ('ERROR::ModelsWatcher:refreshModelsInfo() Model [%s] is invalid \n\tmsg: %s' % (pp, err))
        else:
            raise Exception('Cant find directory with models [%s]' % self.dirModels)
    def toString(self):
        tstr = '%s' % self.dictModelsInfo.values()
        return tstr
    def __str__(self):
        return self.toString()
    def __repr__(self):
        return self.toString()
    #api
    def getModelsInfoAsList(self):
        tret = []
        for mdl in self.dictModelsInfo.values():
            tret.append(mdl.getConfig())
        return tret

####################################
if __name__ == '__main__':
    pass