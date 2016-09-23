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

from app.backend.api import app_flask

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
# class DLSDBInfo:
#     dbType = DBTypes.image2dcls
#     def getDBType(self):
#         return self.dbType
#     def setDBTypeFromStr(self, strType):
#         return DBTypes.getTypeFromString(strType)
#     def setDBType(self, dbType):
#         self.dbType = dbType
#
# class DLSDBInfoImageDB:
#     pathInfo='dbinfo.json'
#     pathLabels='labels.txt'
#     pathMeanImage='mean.binaryproto'
#     pathTrainTxt='train.txt'
#     pathValTxt='val.txt'

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
    def __init__(self, pathCfg=None, isUseFMRootDir=True):
        self.isUseFMRootDir = isUseFMRootDir
        if self.isUseFMRootDir:
            #FIXME: is a good way?
            self.pathRootDir = app_flask.config['DLS_FILEMANAGER_BASE_PATH']
        else:
            self.pathRootDir = None
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
    def getLabels(self):
        tret = self.cfg['dbhist']['labels']
        return tret
    @checkInit
    def getDictLabelsIdx(self):
        lstLabels = self.getLabels()
        tret={}
        for ii,ll in enumerate(lstLabels):
            tret[ll] = ii
        return tret
    @checkInit
    def getDBName(self):
        tret = self.cfg['datasetname']
        return tret
    @checkInit
    def getDBType(self):
        tret = self.cfg['dbType']
        return tret
    # Parameters after postprocessing of the created Dataset
    @checkInit
    def getDateCreationStr(self):
        tret = self.cfg['dbinfo']['date']['str']
        return tret
    @checkInit
    def getDateCreationJson(self):
        tret = self.cfg['dbinfo']['date']
        return tret

    @checkInit
    def getTimeCreationStr(self):
        tret = self.cfg['dbinfo']['time']['str']
        return tret
    @checkInit
    def getTimeCreationJson(self):
        tret = self.cfg['dbinfo']['time']
        return tret
    @checkInit
    def getDBInfoJson(self):
        tret = self.cfg['dbinfo']
        return tret
    def getDBInfoHistsJson(self):
        tret = self.cfg['dbhist']
        return tret
    # Basic parameters
    @checkInit
    def getImageSize(self):
        sizW = self.cfg['formImage']['imgSizes']['x']
        sizH = self.cfg['formImage']['imgSizes']['y']
        return (sizW,sizH)
    @checkInit
    def getImageMode(self):
        return self.cfg['formImage']['imgTypeSelectedId']
    @checkInit
    def getNumChannels(self):
        paramValue=self.cfg['formImage']['imgTypeSelectedId']
        if paramValue == "color":
            return 3
        elif paramValue == "gray":
            return 1
        else:
            return self.raiseIncorrectParameterValue('imgTypeSelectedId', paramValue)
    def getImageShape(self):
        # shape in Caffe notation: [NumberOfRows, NumberOfCols, NumberOfChannels]
        numc,numr=self.getImageSize()
        numch = self.getNumChannels()
        return (numch,numr,numc)
    @checkInit
    def getTransformType(self):
        tkey='resizeTransformSelectedId'
        paramValue = self.cfg['formImage'][tkey]
        if paramValue in TFTypes.getTfTypes():
            return paramValue
        else:
            self.raiseIncorrectParameterValue(tkey, paramValue)
    @checkInit
    def getPercentValidation(self):
        tkey='percentForValidation'
        ret = self.cfg['formFileImport']['fromDir'][tkey]
        return ret
    @checkInit
    def getDbBackendType(self):
        tkey = 'dbBackendSelectedId'
        ret = self.cfg['formDbBackend'][tkey]
        return ret
    @checkInit
    def getImageEncoding(self):
        tkey = 'imageEncodingsSelectedId'
        ret = self.cfg['formDbBackend'][tkey]
        #TODO: check this point
        if ret=='jpeg':
            return 'jpeg'
        elif ret=='png':
            return 'png'
        else:
            return 'none'
    @checkInit
    def getImportDatasetType(self):
        tkey = 'selectedType'
        ret = self.cfg['formFileImport'][tkey]
        if ret in ['dir','txt']:
            return ret
        else:
            self.raiseIncorrectParameterValue(tkey, ret)
    @checkInit
    def isSeparateValDir(self):
        ret = self.cfg['formFileImport']['fromDir']['isUseSeparateValDir']
        return ret
    @checkInit
    def getValidationDir(self):
        tval = self.cfg['formFileImport']['fromDir']['pathToImageFolderVal']
        if self.isUseFMRootDir:
            ret = "%s/%s" % (self.pathRootDir, tval)
        else:
            ret = tval
        return ret
    @checkInit
    def getTrainingDir(self):
        tval = self.cfg['formFileImport']['fromDir']['pathToImageFolder']
        if self.isUseFMRootDir:
            ret = "%s/%s" % (self.pathRootDir, tval)
        else:
            ret = tval
        return os.path.abspath(ret)
    @checkInit
    def isSeparateValTxt(self):
        ret = self.cfg['formFileImport']['fromTxt']['isUseSeparateVal']
        return ret
    @checkInit
    def isUseRelativeDir(self):
        ret = self.cfg['formFileImport']['fromTxt']['isUseRelativeDir']
        return ret
    @checkInit
    def getPercentValidationTxt(self):
        ret = self.cfg['formFileImport']['fromTxt']['percentForValidation']
        return ret
    @checkInit
    def getRelativeDirPath(self):
        tval = self.cfg['formFileImport']['fromTxt']['pathTorRelativeDir']
        if self.isUseFMRootDir:
            ret = "%s/%s" % (self.pathRootDir, tval)
        else:
            ret = tval
        return ret
    @checkInit
    def getPathToImageTxt(self):
        tval = self.cfg['formFileImport']['fromTxt']['pathToImagesTxt']
        if self.isUseFMRootDir:
            ret = "%s/%s" % (self.pathRootDir, tval)
        else:
            ret = tval
        return ret
    @checkInit
    def getPathToImageTxtVal(self):
        tval = self.cfg['formFileImport']['fromTxt']['pathToImagesTxtVal']
        if self.isUseFMRootDir:
            ret = "%s/%s" % (self.pathRootDir, tval)
        else:
            ret = tval
        return ret
    # Parsing:
    def prepareInfoAbout(self):
        pass

if __name__ == '__main__':
    myDBType = DBTypes.image2dcls
    myDBTypeFromStr = DBTypes.getTypeFromString('image2d-cls')
    print ('%s == %s : %s' % (myDBType, myDBTypeFromStr, (myDBType==myDBTypeFromStr)))