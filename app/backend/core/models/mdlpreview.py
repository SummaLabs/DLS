#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import json

from . import CFG_MODEL, CFG_SOLVER, PREFIX_SNAPSHOT, PREFIX_TASKS_DIR

import app.backend.core.utils as dlsutils
from flow_parser import DLSDesignerFlowsParser
from batcher_image2d import BatcherImage2DLMDB

####################################
class ModelTaskDirBuilder:
    @staticmethod
    def buildModelTrainTaskDir(cfgModel):
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
        foutConfigModel  = os.path.join(dirTaskOut, CFG_MODEL)
        foutConfigSolver = os.path.join(dirTaskOut, CFG_SOLVER)
        with open(foutConfigModel, 'w') as f:
            f.write(modelAdjusted.to_json(sort_keys=True, indent=4, separators=(',', ': ')))
        with open(foutConfigSolver, 'w') as f:
            f.write(json.dumps(solverConfig, indent=4))

if __name__ == '__main__':
    pass