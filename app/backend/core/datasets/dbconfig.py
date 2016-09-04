#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import sys
import glob
import fnmatch
import numpy as np
import json
from enum import Enum
from functools import wraps

#################################################
class DBTypes(Enum):
    texttable   = 'text-table'
    image2dcls  = 'image2d-cls'
    image2dmap  = 'image2d-mapcls'
    image2dsegm = 'image2d-semg'
    image3dcls  = 'image3d-cls'
    image3dsegm = 'image3d-semg'
    @staticmethod
    def getTypeFromString(str):
        invDict = {}
        for kk,vv in DBTypes.__members__.items():
            invDict[vv.value] = vv
        if str in invDict.keys():
            return invDict[str]
        else:
            raise Exception('Unknown DB-Type string [%s]' % str)

class TFTypes:
    squash   = 'squash'
    fill     = 'fill'
    crop     = 'crop'
    cropFill = 'half-crop-fill'
    @staticmethod
    def getTfTypes():
        return [TFTypes.squash, TFTypes.crop, TFTypes.fill, TFTypes.cropFill]

#################################################
class DLSDBInfo:
    dbType = DBTypes.image2dcls
    def getDBType(self):
        return self.dbType
    def setDBTypeFromStr(self, strType):
        return DBTypes.getTypeFromString(strType)
    def setDBType(self, dbType):
        self.dbType = dbType

class DLSDBInfoImageDB:
    pathInfo='dbinfo.json'
    pathLabels='labels.txt'
    pathMeanImage='mean.binaryproto'
    pathTrainTxt='train.txt'
    pathValTxt='val.txt'

#################################################
class DBImage2DConfig:
    @staticmethod
    def readConfig(pathToJson):
        with open(pathToJson, 'r') as f:
            ret = json.load(f)
            return ret
    # decorator for check init-state
    def checkInit(fun):
        @wraps(fun)
        def wrapped(inst, *args, **kwargs):
            if inst.isInitialized():
                return fun(inst, *args, **kwargs)
            else:
                inst.raiseErrorNotInitialized()
        return wrapped
    def __init__(self, pathCfg=None):
        self.cfg    = None
        self.path   = None
        if pathCfg is not None:
            self.path=pathCfg
            self.cfg = DBImage2DConfig.readConfig(self.path)
    def toString(self):
        if not self.isInitialized():
            str = "object DBImage2DConfig is not initialized..."
        else:
            str = json.dumps(self.cfg, indent=4)
        return str
    def __repr__(self):
        return self.toString()
    def __str__(self):
        return self.toString()
    def isInitialized(self):
        return (self.path is not None) and (self.cfg is not None)
    def raiseError(self, strError):
        print ("Error: %s" % strError)
        raise Exception(strError)
    def raiseErrorNotInitialized(self):
        strError = "class DBImage2DConfig is not correctly initialized"
        return self.raiseError(strError)
    def raiseIncorrectParameterValue(self, strParamName, strParamValue):
        strError = "incorrect value [%s] for parameter [%s]" % (strParamValue, strParamName)
        print ("Error: %s" % strError)
        raise Exception(strError)
    # validation
    def validate(self):
        #TODO: append validation code!
        pass
    # api
    @checkInit
    def getImageSize(self):
        # if self.isInitialized():
        sizW = self.cfg['formImage']['imgSizes']['x']
        sizH = self.cfg['formImage']['imgSizes']['y']
        return (sizW,sizH)
        # else:
        #     self.raiseErrorNotInitialized()
    @checkInit
    def getImageMode(self):
        # if self.isInitialized():
        return self.cfg['formImage']['imgTypeSelectedId']
        # else:
        #     self.raiseErrorNotInitialized()
    @checkInit
    def getNumChannels(self):
        # if self.isInitialized():
        paramValue=self.cfg['formImage']['imgTypeSelectedId']
        if paramValue == "color":
            return 3
        elif paramValue == "gray":
            return 1
        else:
            return self.raiseIncorrectParameterValue('imgTypeSelectedId', paramValue)
        # else:
        #     self.raiseErrorNotInitialized()
    def getImageShape(self):
        # shape in Caffe notation: [NumberOfRows, NumberOfCols, NumberOfChannels]
        numc,numr=self.getImageSize()
        numch = self.getNumChannels()
        return (numch,numr,numc)
    @checkInit
    def getTransformType(self):
        # if self.isInitialized():
        tkey='resizeTransformSelectedId'
        paramValue = self.cfg['formImage'][tkey]
        if paramValue in TFTypes.getTfTypes():
            return paramValue
        else:
            self.raiseIncorrectParameterValue(tkey, paramValue)
        # else:
        #     self.raiseErrorNotInitialized()
    @checkInit
    def getPercentValidation(self):
        # if self.isInitialized():
        tkey='percentForValidation'
        ret = self.cfg['formFileImport']['fromDir'][tkey]
        return ret
        # else:
        #     self.raiseErrorNotInitialized()
    @checkInit
    def getDbType(self):
        # if self.isInitialized():
        tkey = 'dbBackendSelectedId'
        ret = self.cfg['formDbBackend'][tkey]
        return ret
        # else:
        #     self.raiseErrorNotInitialized()
    @checkInit
    def getImageEncoding(self):
        # if self.isInitialized():
        tkey = 'imageEncodingsSelectedId'
        ret = self.cfg['formDbBackend'][tkey]
        #TODO: check this point
        if ret=='jpeg':
            return 'jpeg'
        elif ret=='png':
            return 'png'
        else:
            return 'none'
        # else:
        #     self.raiseErrorNotInitialized()
    @checkInit
    def getImportDatasetType(self):
        # if self.isInitialized():
        tkey = 'selectedType'
        ret = self.cfg['formFileImport'][tkey]
        if ret in ['dir','txt']:
            return ret
        else:
            self.raiseIncorrectParameterValue(tkey, ret)
        # else:
        #     self.raiseErrorNotInitialized()
    @checkInit
    def isSeparateValDir(self):
        # if self.isInitialized():
        ret = self.cfg['formFileImport']['fromDir']['isUseSeparateValDir']
        return ret
        # else:
        #     self.raiseErrorNotInitialized()
    @checkInit
    def getValidationDir(self):
        # if self.isInitialized():
        ret = self.cfg['formFileImport']['fromDir']['pathToImageFolderVal']
        return ret
        # else:
        #     self.raiseErrorNotInitialized()
    @checkInit
    def getTrainingDir(self):
        # if self.isInitialized():
        ret = self.cfg['formFileImport']['fromDir']['pathToImageFolder']
        return os.path.abspath(ret)
        # else:
        #     self.raiseErrorNotInitialized()
    @checkInit
    def isSeparateValTxt(self):
        # if self.isInitialized():
        ret = self.cfg['formFileImport']['fromTxt']['isUseSeparateVal']
        return ret
        # else:
        #     self.raiseErrorNotInitialized()
    @checkInit
    def isUseRelativeDir(self):
        # if self.isInitialized():
        ret = self.cfg['formFileImport']['fromTxt']['isUseRelativeDir']
        return ret
        # else:
        #     self.raiseErrorNotInitialized()
    @checkInit
    def getPercentValidationTxt(self):
        ret = self.cfg['formFileImport']['fromTxt']['percentForValidation']
        return ret
    @checkInit
    def getRelativeDirPath(self):
        ret = self.cfg['formFileImport']['fromTxt']['pathTorRelativeDir']
        return ret
    @checkInit
    def getPathToImageTxt(self):
        ret = self.cfg['formFileImport']['fromTxt']['pathToImagesTxt']
        return ret
    @checkInit
    def getPathToImageTxtVal(self):
        ret = self.cfg['formFileImport']['fromTxt']['pathToImagesTxtVal']
        return ret
    # Parsing:
    def prepareInfoAbout(self):
        pass

if __name__ == '__main__':
    myDBType = DBTypes.image2dcls
    myDBTypeFromStr = DBTypes.getTypeFromString('image2d-cls')
    print ('%s == %s : %s' % (myDBType, myDBTypeFromStr, (myDBType==myDBTypeFromStr)))