#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import glob

import skimage.io as io
import matplotlib.pyplot as plt

from app.backend.core.datasets.dbimageinfo import DatasetImage2dInfo
from app.backend.core.datasets.imgproc2d import ImageTransformer2D

pathWithDatasets='../../../data/datasets'

if __name__ == '__main__':
    lstDir=glob.glob('%s/dbset-*' % pathWithDatasets)
    numDir=len(lstDir)
    if numDir>5:
        numDir=5
    plt.figure()
    for ii in range(numDir):
        pathDB = lstDir[ii]
        dbImage2dInfo = DatasetImage2dInfo(pathDB)
        if dbImage2dInfo.checkIsAValidImage2dDir():
            dbImage2dInfo.loadDBInfo()
            dbName = dbImage2dInfo.getInfoStat()['name']
            pathMeanImage = dbImage2dInfo.pathMeanImage
            imgMean = io.imread(pathMeanImage)
            plt.subplot(1, numDir, ii + 1)
            plt.imshow(imgMean)
            plt.title(dbName)
    plt.show()