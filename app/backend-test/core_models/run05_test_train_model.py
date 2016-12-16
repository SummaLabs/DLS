#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'


import os
import glob
import app.backend.core.utils as dlsutils
from app.backend.core.models.keras_trainer_v4 import KerasTrainer

pathWithModels='../../../data/models'

if __name__ == '__main__':
    lstModels=glob.glob('%s/mdltask-*' % pathWithModels)
    numModels=max(3, len(lstModels))
    for ii in range(numModels):
        mdlID=os.path.basename(lstModels[ii])
        pathModelDir = os.path.join(dlsutils.getPathForModelsDir(), os.path.basename(mdlID))
        print ('[%d/%d] train model [%s]' % (ii, numModels, pathModelDir))
        trainer = KerasTrainer()
        trainer.loadModelFromTaskModelDir(pathModelDir)
        trainer.runTrain()
