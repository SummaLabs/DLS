#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import glob
import os
import pprint

import matplotlib.pyplot as plt
import skimage.io as skio

from app.backend.core.models.keras_trainer_v4 import KerasTrainer
from app.backend.core.datasets.api import datasetWatcher

from app.backend.core.models.api import modelsWatcher
from app.backend.core.models.keras_trainer_v3 import KerasTrainer

dirWithImages='../../../data-test/test-inference'

if __name__ == '__main__':
    for kk,vv in modelsWatcher.dictModelsInfo.items():
        print ('[%s] : %s' % (kk, vv))
    # (1) search & show test-dirs:
    lstTestSet=[(os.path.basename(xx),os.path.abspath(xx)) for xx in glob.glob('%s/*' % dirWithImages) if os.path.isdir(xx)]
    pprint.pprint(lstTestSet)
    # (2) search all images for every images-set:
    dictImages={ xx[0]:glob.glob('%s/*.jpg' % xx[1]) for xx in lstTestSet}
    pprint.pprint(dictImages)
    #
    # modelInfo = modelsWatcher.dictModelsInfo[modelsWatcher.dictModelsInfo.keys()[0]]
    for modelInfo in modelsWatcher.dictModelsInfo.values():
        trainer = KerasTrainer()
        trainer.loadModelFromTrainingStateInDir(modelInfo.dirModel)
        for kk,vv in dictImages.items():
            tfig = plt.figure()
            tfig.canvas.set_window_title('Model-Id : %s, dataset: %s' % (modelInfo.getId(), kk))
            numImg = len(vv)
            for ii,pp in enumerate(vv):
                tret = trainer.inferOneImagePathSorted(pp)
                plt.subplot(2, numImg, 0*numImg + ii + 1)
                plt.imshow(skio.imread(pp))
                plt.title('L: [%s], P: %0.3f' % (tret['best']['label'], tret['best']['prob']))
                dataP = [xx[1] for xx in tret['distrib']]
                dataL = [xx[0] for xx in tret['distrib']]
                plt.subplot(2, numImg, 1*numImg + ii + 1)
                tmpX = range(len(dataP))
                plt.plot(tmpX, dataP)
                plt.xticks(tmpX, dataL)
                plt.grid(True)
                pprint.pprint(tret, indent=4)
        plt.show()
        print ('*** Close all windows to visualize next model-inference!')