#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import glob

import numpy as np

import matplotlib.pyplot as plt

from app.backend.core.datasets.dbpreview import DatasetsWatcher, DatasetImage2dInfo
from app.backend.core.models.batcher_image2d import BatcherImage2DLMDB

pathWithDatasets='../../../data/datasets'

if __name__ == '__main__':
    dbWatcher = DatasetsWatcher(pathWithDatasets)
    dbWatcher.refreshDatasetsInfo()
    numDb = min(len(dbWatcher.dictDbInfo),5)
    nr=3
    nc=4
    sizBatch=nr*nc
    for ii,kk in enumerate(dbWatcher.dictDbInfo.keys()[:numDb]):
        dbInfo = dbWatcher.dictDbInfo[kk]
        batcher=BatcherImage2DLMDB(dbInfo.pathDB)
        dataImg,dataLbl = batcher.getBatch(batchSize=sizBatch)
        tfig = plt.figure()
        print ('[%d/%d] prepare batch for db [%s]' % (ii, numDb, dbInfo.dbId))
        tfig.canvas.set_window_title('db : %s (displayed only 1st channel)' % dbInfo.dbId)
        for kk in range(sizBatch):
            plt.subplot(nr,nc,kk+1)
            plt.imshow(dataImg[kk][0], cmap=plt.gray())
            tlblId = np.argmax(dataLbl[kk])
            plt.title('Label = [%d] : %s' % (tlblId, dbInfo.labels[tlblId]))
    plt.show()