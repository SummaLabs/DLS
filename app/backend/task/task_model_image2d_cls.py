#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import json

from task import Task
import random

from app.backend.core.models.keras_trainer_v3 import KerasTrainer
from app.backend.core.models.mdlpreview import ModelTaskDirBuilder
from app.backend.core.models.api import modelsWatcher
from app.backend.core import utils as dlsutils


class TaskModelTeainImage2DCls(Task, KerasTrainer):
    prefixModel = 'mdltask'
    prefixProgress = 'progress.json'
    modelId=None
    dirModel=None
    pathProgress=None
    def __init__(self, configJson):
        # (1) Task-constructor:
        Task.__init__(self)
        # (2) prepare model-directory
        self.modelId,self.dirModel = ModelTaskDirBuilder.buildModelTrainTaskDir(configJson)
        self.pathProgress = os.path.join(self.dirModel, self.prefixProgress)
        # (3) prepare trainer
        KerasTrainer.__init__(self)
        self.text   = 'Model Train: Image2D Cls'
        self.type   = 'model-train-image2d-cls'
        self.basetype = 'model'
        self.icon = "/frontend/assets/icon/img/img-model1.png"
    def dumpTrainProgress(self, status):
        if (self.trainLog is not None) and len(self.trainLog)>0:
            tret = self.trainLog
            if self.alive:
                tret['status'] = status
            with open(self.pathProgress, 'w') as f:
                f.write(json.dumps(tret, indent=4))
    def perform(self):
        self.logger.info('Create model directory: %s' % self.modelId)
        self.loadModelFromTaskModelDir(self.dirModel)
        if not self.isOk():
            strErr = 'KerasTrainer is not correctly initialized'
            self.printError(strErr)
            raise Exception(strErr)
        self.logger.info('Start trainig')
        #FIXME: i think, that this code is not working
        if self.deviceType.startswith('gpu'):
            import theano.sandbox.cuda
            theano.sandbox.cuda.use(self.deviceType)
        self.progress = 0
        if self.numEpoch < 1:
            self.numEpoch = 1
        self.printInterval = int(self.numIterPerEpoch*0.1)
        if self.printInterval<1:
            self.printInterval=1
        for ei in xrange(self.numEpoch):
            for ii in xrange(self.numIterPerEpoch):
                if not self.alive:
                    self.dumpTrainProgress('aborted')
                    break
                self.progress = ((100*self.currentIter)/(self.numIterPerEpoch*self.numEpoch))
                isNeedPrintInfo = self.trainOneIter()
                if isNeedPrintInfo:
                    self.rows.append({'c': [
                        {'v': self.currentIter},
                        {'v': '%0.4f' % self.trainLog['accTrain'][-1]},
                        {'v': '%0.4f' % self.trainLog['accVal'][-1]}
                    ]})
                    self.dumpTrainProgress('running')
            if (ei % self.intervalSaveModel) == 0:
                self.saveModelState()
            #FIXME: temporary remove validation for speedup training (on DEBUG stage)
            if (ei % self.intervalValidation) == 0:
                pass
        self.progress = 100
        self.state = 'finished'
        self.dumpTrainProgress(self.state)
        self.alive = False
        modelsWatcher.refreshModelsInfo()
    # while self.alive:
    #     time.sleep(2)
    #     self.progress += 10
    #     self.rows.append({'c': [{'v': self.progress}, {'v': random.random()}, {'v': random.random()}]})
    #     if self.progress>=100:
    #         self.state='finished'
    #         self.alive=False

if __name__ == '__main__':
    pass