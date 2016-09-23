#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import numpy as np
import lmdb

from keras.utils import np_utils

from app.backend.core.datasets.dbconfig import DBImage2DConfig
from app.backend.core.datasets.dbpreview import DatasetImage2dInfo
from app.backend.core.datasets.imgproc2d import ImageTransformer2D

#########################
class BatcherImage2DLMDB:
    cfg         = None
    sizeBatch   = 64
    numTrain    = -1
    numVal      = -1
    numLbl      = -1
    lbl         = None
    keysTrain   = None
    keysVal     = None
    shapeImg    = None
    meanImg     = None
    meanChannel = None
    meanChImage = None
    dbTrain     = None
    dbVal       = None
    isRemoveMean= True
    scaleFactor = 1./255.
    def __init__(self, parPathDB=None, parSizeBatch=-1, scaleFactor=-1.):
        if parPathDB is None:
            #FIXME: check this point, LMDBBatcher is not initialized correctly
            return
        try:
            self.cfg     = DatasetImage2dInfo(parPathDB)
            self.cfg.loadDBInfo(isBuildSearchIndex=False)
            tpathTrainDB = self.cfg.pathDbTrain
            tpathValDB   = self.cfg.pathDbVal
            self.dbTrain = lmdb.open(tpathTrainDB, readonly=True)
            self.dbVal   = lmdb.open(tpathValDB,   readonly=True)
            with self.dbTrain.begin() as txnTrain, self.dbVal.begin() as txnVal:
                self.lbl    = self.cfg.labels
                self.numLbl = len(self.lbl)
                self.numTrain = self.dbTrain.stat()['entries']
                self.numVal   = self.dbVal.stat()['entries']
                with txnTrain.cursor() as cursTrain, txnVal.cursor() as cursVal:
                    self.keysTrain = np.array([key for key, _ in cursTrain])
                    self.keysVal   = np.array([key for key, _ in cursVal])
                    timg,_ = ImageTransformer2D.decodeLmdbItem2NNSampple(txnTrain.get(self.keysTrain[0]))
                    self.shapeImg = timg.shape
                if parSizeBatch > 1:
                    self.sizeBatch = parSizeBatch
                if scaleFactor > 0:
                    self.scaleFactor = scaleFactor
                self.loadMeanProto()
        except lmdb.Error as err:
            self.pathDataDir = None
            print 'LMDBReader.Error() : [%s]' % err
    def loadFromTrainDir(self, pathTrainDir, parImgShape=None):
        if parImgShape is not None:
            self.shapeImg = parImgShape
        self.pathDataDir = pathTrainDir
        tpathLabels = self.getPathLabels()
        #FIXME: potential bug
        if os.path.isfile(tpathLabels):
            with open(tpathLabels,'r') as f:
                self.lbl = f.read().splitlines()
        self.loadMeanProto()
    def close(self):
        if self.isOk():
            self.numTrain   = -1
            self.numVal     = -1
            self.numLbl     = -1
            self.dbTrain.close()
            self.dbVal.close()
    def getPath(self,localPath):
        if self.pathDataDir is not None:
            return os.path.join(self.pathDataDir, localPath)
        else:
            return localPath
    def getPathLabels(self):
        return self.cfg.pathLabels
    def getPathTrainDB(self):
        return self.cfg.pathDbTrain
    def getPathValDB(self):
        return self.cfg.pathDbVal
    def getPathMeanProto(self):
        return self.cfg.pathMeanData
    def loadMeanProto(self):
        self.meanImg = ImageTransformer2D.loadImageFromBinaryBlog(self.cfg.pathMeanData)*self.scaleFactor
        self.meanChannel = np.mean(self.meanImg, axis=(1, 2))
        self.meanChImage = np.zeros(self.meanImg.shape, dtype=self.meanImg.dtype)
        for ii in range(self.meanImg.shape[0]):
            self.meanChImage[ii,:,:] = self.meanChannel[ii]
    def isOk(self):
        return ((self.numTrain > 0) and (self.numVal > 0) and (self.numLbl>0))
    def getBatch(self, isTrainData=True, isShuffle=True, batchSize=-1, reshape2Shape=None):
        if batchSize<1:
            batchSize = self.sizeBatch
        if self.isOk():
            if isTrainData:
                tptrkDB  = self.dbTrain
                tptrKeys = self.keysTrain
            else:
                tptrkDB  = self.dbVal
                tptrKeys = self.keysVal
            with tptrkDB.begin() as txn:
                if isShuffle:
                    np.random.shuffle(tptrKeys)
                tbatchKeys = tptrKeys[:batchSize]
                tsizeX = [batchSize, self.shapeImg[0], self.shapeImg[1], self.shapeImg[2]]
                dataX = np.zeros(tsizeX, np.float32)  # FIXME: [1] check data type! [float32/float64]
                dataY = []
                for ii in xrange(batchSize):
                    timg,tlabel=ImageTransformer2D.decodeLmdbItem2NNSampple(txn.get(b'%s' % tbatchKeys[ii]))
                    timg = timg.astype(np.float)*self.scaleFactor
                    if self.isRemoveMean:
                        timg-=self.meanChImage
                    dataY.append(tlabel)
                    dataX[ii] = timg  # FIXME: [1] check data type! [float32/float64]
                dataY = np_utils.to_categorical(np.array(dataY), self.numLbl)
                if ((reshape2Shape is None) or (reshape2Shape[1:] == self.shapeImg)):
                    return (dataX, dataY)
                else:
                    #FIXME: reshaping can raise Exception "shape mismatch"
                    dataX=dataX.reshape([self.sizeBatch] + reshape2Shape[1:])
                    return (dataX, dataY)
        else:
            return None
    def loadAllDataTrain(self):
        if self.isOk():
            return self.getBatch(isTrainData=True, isShuffle=False, batchSize=self.numTrain)
        else:
            return None
    def loadAllDataVal(self):
        if self.isOk():
            return self.getBatch(isTrainData=True, isShuffle=False, batchSize=self.numVal)
        else:
            return None
    def getBatchTrain(self, reshape2Shape=None):
        return self.getBatch(isTrainData=True, reshape2Shape=reshape2Shape)
    def getBatchVal(self, reshape2Shape=None):
        return self.getBatch(isTrainData=False, reshape2Shape=reshape2Shape)

if __name__ == '__main__':
    pass