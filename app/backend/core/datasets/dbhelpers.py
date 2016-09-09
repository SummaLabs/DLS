#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import sys
import glob
import fnmatch
import numpy as np
import json
import pandas as pd

from dbutils import calcNumImagesByLabel, getListDirNamesInDir, getListImagesInDirectory, checkFilePath

#################################################
class DBImageImportReader:
    numTrainImages=0
    numValImages=0
    dbConfig=None
    listLabels=None
    listTrainPath=None
    listValPath = None
    # TODO: is a good place for this parameter?
    minSamplesPerClass = 5
    def __init__(self, dbImage2DConfig):
        self.setConfig(dbImage2DConfig)
    # interface
    def resetInfo(self):
        self.numLabels      = 0
        self.numTrainImages = 0
        self.numValImages   = 0
        self.listTrainPath  = None
        self.listValPath    = None
        self.listLabels     = None
    def setConfig(self, dbImage2DConfig):
        self.resetInfo()
        self.dbConfig = dbImage2DConfig
    def getConfig(self):
        return self.dbConfig
    def getNumTotalImages(self):
        return (self.numTrainImages+self.numValImages)
    def getNumTrainImages(self):
        return self.numTrainImages
    def getNumValImages(self):
        return self.numValImages
    def getNumOfLabels(self):
        if self.listLabels is not None:
            return len(self.listLabels)
        else:
            return 0
    def getNumByLabelsTrain(self):
        return calcNumImagesByLabel(self.listLabels, self.listTrainPath)
    def getNumByLabelsVal(self):
        return calcNumImagesByLabel(self.listLabels, self.listValPath)
    # Override:
    def getPathTrainImageByIdx(self, idx):
        pass
    def getPathValImageByIdx(self, idx):
        pass
    def precalculateInfo(self):
        pass
    # Helpers:
    def toString(self):
        retStr = "%s: #Labels=%d: [%s], #TrainImages=%d, #ValImages=%d" % (
            self.__class__,
            self.getNumOfLabels(),
            self.listLabels,
            self.numTrainImages,
            self.numValImages)
        return retStr
    def __repr__(self):
        return self.toString()
    def __str__(self):
        return self.toString()
    # private helpers-methods
    def _checkNumberOfSamples(self, mapPath, plstLabels, strPref=""):
        arrNumSamples = np.array([len(mapPath[ll]) for ll in plstLabels])
        arrLabels = np.array(plstLabels)
        badLabels = arrLabels[arrNumSamples < self.minSamplesPerClass]
        if len(badLabels) > 0:
            strBadLabels = ", ".join(badLabels.tolist())
            strError = "Incorrect dataset size (%s): labels [%s] has less than %d samples per class" % (
            strPref, strBadLabels, self.minSamplesPerClass)
            raise Exception(strError)
    def _postprocPrecalcInfo(self):
        self._checkNumberOfSamples(self.listTrainPath, self.listLabels, strPref='Train')
        self._checkNumberOfSamples(self.listValPath, self.listLabels, strPref='Validation')
        self.numTrainImages = sum(self.getNumByLabelsTrain().values())
        self.numValImages = sum(self.getNumByLabelsVal().values())
        self.numLabels = len(self.listLabels)

#################################################
class DBImageImportReaderFromDir(DBImageImportReader):
    """
    Load Dataset info from directory.
    Directoty structure:
    /path/to/dir-with-images/
          .
          |--class1/
          |--class2/
          |--class3/
          |--...
          \__classN/
    """
    # def __init__(self, dbImage2DConfig):
    #     DBImageReader.__init__(self,dbImage2DConfig)
    def precalculateInfoFromOneDir(self):
        tpathImages = self.dbConfig.getTrainingDir()
        if not os.path.isdir(tpathImages):
            raise Exception("Cant find directory with images [%s]" % tpathImages)
        self.listLabels = getListDirNamesInDir(tpathImages)
        if len(self.listLabels)<2:
            strErr = "Incorrect number of classes in directory [%s], more than one needed" % (tpathImages)
            raise Exception(strErr)
        # (1) prepare list of image-paths for all images
        tlistPath = {}
        for ll in self.listLabels:
            tlistPath[ll] = getListImagesInDirectory(os.path.join(tpathImages, ll))
        # (2) check number of images per-class
        self._checkNumberOfSamples(tlistPath, self.listLabels)
        # (3) split set by train/val
        self.listTrainPath={}
        self.listValPath={}
        ptrain = 1. - float(self.dbConfig.getPercentValidation())/100.
        for ll in self.listLabels:
            tnum=len(tlistPath[ll])
            tnumTrain = int (tnum * ptrain)
            tlstPermute = np.random.permutation(np.array(tlistPath[ll]))
            self.listTrainPath[ll] = tlstPermute[:tnumTrain].tolist()
            self.listValPath[ll]   = tlstPermute[tnumTrain:].tolist()
        # (4) check Train/Validation lists of classes
        self._postprocPrecalcInfo()
    def precalculateInfoFromSepDir(self):
        tpathTrain = self.dbConfig.getTrainingDir()
        tpathVal = self.dbConfig.getValidationDir()
        if not os.path.isdir(tpathTrain):
            raise Exception("Cant find Train directory [%s]" % tpathTrain)
        if not os.path.isdir(tpathVal):
            raise Exception("Cant find Validation directory [%s]" % tpathVal)
        lstLblTrain     = getListDirNamesInDir(tpathTrain)
        lstLblVal       = getListDirNamesInDir(tpathVal)
        #TODO: check label validation code (based on operations with sets)
        if len(set(lstLblTrain).difference(set(lstLblVal)))>0:
            strErr = "Train set [%s] does not coincide with Validation set [%s]" % (lstLblTrain, lstLblVal)
            raise Exception(strErr)
        self.listLabels = list(set(lstLblTrain + lstLblVal))
        self.listTrainPath={}
        self.listValPath={}
        for ll in self.listLabels:
            self.listTrainPath[ll]  = getListImagesInDirectory(os.path.join(tpathTrain, ll))
            self.listValPath[ll]    = getListImagesInDirectory(os.path.join(tpathVal, ll))
        self.numTrainImages = sum(self.getNumByLabelsTrain().values())
        self.numValImages   = sum(self.getNumByLabelsVal().values())
        self.numLabels      = len(self.listLabels)
    def precalculateInfo(self):
        if not self.dbConfig.isInitialized():
            self.dbConfig.raiseErrorNotInitialized()
        if self.dbConfig.isSeparateValDir():
            self.precalculateInfoFromSepDir()
        else:
            self.precalculateInfoFromOneDir()

#################################################
class DBImageImportReaderFromCSV(DBImageImportReader):
    pathRootDir=None
    def precalculateInfoFromOneCSV(self):
        isRelPath = self.dbConfig.isUseRelativeDir()
        if isRelPath:
            tpathDirRel = self.dbConfig.getRelativeDirPath()
            checkFilePath(tpathDirRel, isDirectory=True)
        tpathTxt  = self.dbConfig.getPathToImageTxt()
        checkFilePath(tpathTxt)
        tdataTxt = pd.read_csv(tpathTxt, header=None, sep=',')
        #TODO: append more validation rules
        if len(tdataTxt.shape)<2:
            raise Exception('Incorrect CSV file [%s]' % tpathTxt)
        #FIXME: check yhis point: is a good way to permute data?
        tdataTxt = tdataTxt.as_matrix()[np.random.permutation(range(tdataTxt.shape[0])),:]
        self.listLabels  = np.sort(np.unique(tdataTxt[:,1])).tolist()
        tlistPath = {}
        for ll in self.listLabels:
            tmp = tdataTxt[tdataTxt[:, 1] == ll, 0].tolist()
            if not isRelPath:
                tlistPath[ll] = tmp
            else:
                tlistPath[ll] = [os.path.join(tpathDirRel, ii) for ii in tmp]
        self.listTrainPath = {}
        self.listValPath = {}
        ptrain = 1. - float(self.dbConfig.getPercentValidationTxt())/100.
        for ll in self.listLabels:
            tnum = len(tlistPath[ll])
            tnumTrain = int(tnum * ptrain)
            tlstPermute = np.random.permutation(np.array(tlistPath[ll]))
            self.listTrainPath[ll] = tlstPermute[:tnumTrain].tolist()
            self.listValPath[ll] = tlstPermute[tnumTrain:].tolist()
        self._postprocPrecalcInfo()
    def precalculateInfoFromSeparateCSV(self):
        isRelPath = self.dbConfig.isUseRelativeDir()
        if isRelPath:
            tpathDirRel = self.dbConfig.getRelativeDirPath()
            checkFilePath(tpathDirRel, isDirectory=True)
        tpathTxtTrain = self.dbConfig.getPathToImageTxt()
        tpathTxtVal   = self.dbConfig.getPathToImageTxtVal()
        checkFilePath(tpathTxtTrain)
        checkFilePath(tpathTxtVal)
        tdataTxtTrain = pd.read_csv(tpathTxtTrain, header=None, sep=',')
        tdataTxtVal   = pd.read_csv(tpathTxtVal,   header=None, sep=',')
        #TODO: append more validation rules
        if len(tdataTxtTrain.shape)<2:
            raise Exception('Incorrect CSV file [%s]' % tpathTxtTrain)
        if len(tdataTxtVal.shape) < 2:
            raise Exception('Incorrect CSV file [%s]' % tpathTxtVal)
        tdataTxtTrain = tdataTxtTrain.as_matrix()
        tdataTxtVal   = tdataTxtVal.as_matrix()
        lstLabelsTrain = np.unique(tdataTxtTrain[:, 1]).tolist()
        lstLabelsVal   = np.unique(tdataTxtVal  [:, 1]).tolist()
        self.listLabels = sorted(list(set(lstLabelsTrain + lstLabelsVal)))
        self.listTrainPath={}
        self.listValPath={}
        for ll in self.listLabels:
            tmpTrain = tdataTxtTrain[tdataTxtTrain[:,1]==ll,0].tolist()
            tmpVal   = tdataTxtVal  [tdataTxtVal  [:,1]==ll,0].tolist()
            if not isRelPath:
                self.listTrainPath[ll]  = tmpTrain
                self.listValPath[ll]    = tmpVal
            else:
                self.listTrainPath[ll] = [os.path.join(tpathDirRel,ii) for ii in tmpTrain]
                self.listValPath[ll]   = [os.path.join(tpathDirRel,ii) for ii in tmpVal  ]
        self._postprocPrecalcInfo()
    def precalculateInfo(self):
        if not self.dbConfig.isInitialized():
            self.dbConfig.raiseErrorNotInitialized()
        if self.dbConfig.isSeparateValTxt():
            self.precalculateInfoFromSeparateCSV()
        else:
            self.precalculateInfoFromOneCSV()

if __name__ == '__main__':
    pass