import os
import sys
import glob

from dbbuilder import DBImage2DBuilder, DBImage2DConfig
from imgproc2d import ImageTransformer2D

import json
import time
import lmdb
import numpy as np

try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO

import dlscaffe.caffedls_pb2 as dlscaffe_pb2
from PIL import Image

from app.backend.api import app_flask
from app.backend.core import utils

###############################
class DatasetImage2dInfo:
    fconfig=DBImage2DBuilder.fconfig
    dbVal=DBImage2DBuilder.lmdbVal
    dbTrain=DBImage2DBuilder.lmdbTrain
    fmeanData=DBImage2DBuilder.fmeanData
    fmeanImage=DBImage2DBuilder.fmeanImage
    flabels=DBImage2DBuilder.flabels
    fpreview='preview_5x3.jpg'
    #
    pathDB=None
    pathConfig=None
    pathMeanData=None
    pathMeanImage=None
    pathLabels=None
    #
    sizeInBytesTrain=0
    sizeInBytesVal=0
    sizeInBytesTotal=0
    #
    labels=None
    dictLabelsIdx=None
    dbIndex=None
    cfg=None
    def __init__(self, pathDB):
        self.pathDB = pathDB
        if os.path.isdir(self.pathDB):
            self.pathConfig     = os.path.join(self.pathDB, self.fconfig)
            self.pathMeanData   = os.path.join(self.pathDB, self.fmeanData)
            self.pathMeanImage  = os.path.join(self.pathDB, self.fmeanImage)
            self.pathLabels     = os.path.join(self.pathDB, self.flabels)
            self.pathDbTrain    = os.path.join(self.pathDB, self.dbTrain)
            self.pathDbVal      = os.path.join(self.pathDB, self.dbVal)
            self.pathPreview    = os.path.join(self.pathDB, self.fpreview)
            self.dbId           = os.path.basename(self.pathDB)
    def checkIsAValidImage2dDir(self):
        isValidDir=True
        if not os.path.isdir(self.pathDB):
            return False
        if not os.path.isfile(self.pathConfig):
            return False
        if not os.path.isfile(self.pathMeanData):
            return False
        if not os.path.isfile(self.pathMeanImage):
            return False
        if not os.path.isfile(self.pathLabels):
            return False
        if (not os.path.isdir(self.pathDbTrain)) or (not os.path.isdir(self.pathDbVal)):
            return False
        if not os.path.isfile(self.pathPreview):
            return False
        return isValidDir
    def isInitialized(self):
        return (self.cfg is not None)
    def loadDBInfo(self, isBuildSearchIndex=True):
        if self.checkIsAValidImage2dDir():
            self.cfg = DBImage2DConfig(self.pathConfig)
            if not self.cfg.isInitialized():
                strErr = 'Invalid DB config JSON file [%s]' % self.pathConfig
                raise Exception(strErr)
            try:
                self.sizeInBytesTrain   = utils.getDirectorySizeInBytes(self.pathDbTrain)
                self.sizeInBytesVal     = utils.getDirectorySizeInBytes(self.pathDbVal)
                self.sizeInBytesTotal   = self.sizeInBytesTrain+self.sizeInBytesVal
                #
                self.labels = self.cfg.getLabels()
                if isBuildSearchIndex:
                    self.dictLabelsIdx = self.cfg.getDictLabelsIdx()
                    self.dbIndex = {
                        'train': self.buildKeyIndexForLabels('train'),
                        'val':   self.buildKeyIndexForLabels('val')
                    }
            except Exception as terr:
                strErr = 'Cant calculate size for dir, Error: %s' % (terr)
                print (strErr)
                self.sizeInBytesTrain = 0
                self.sizeInBytesVal   = 0
                self.sizeInBytesTotal = 0
                # raise Exception(strErr)
        else:
            strErr = 'Path [%s] is not a valid Image2D DB directory' % self.pathDB
            raise Exception(strErr)
    def buildKeyIndexForLabels(self, ptype):
        if ptype=='train':
            tpathLMDB=self.pathDbTrain
        else:
            tpathLMDB = self.pathDbVal
        with lmdb.open(tpathLMDB) as env:
            with env.begin(write=False) as  txn:
                arrKeysDB       = np.array([key for key, _ in txn.cursor()])
                arrLblIdx       = np.array([int(xx[:6]) for xx in arrKeysDB])
                tmapIdx={}
                # (1) for every label we build array of indexes
                for ii in range(len(self.labels)):
                    tmapIdx[ii] = np.where(arrLblIdx==ii)[0]
                # (2) for 'all' data we build fake array of indexes: all range
                tmapIdx[len(self.labels)] = np.arange(len(arrLblIdx))
                return {
                    'map':      tmapIdx,
                    'keys':     arrKeysDB,
                    'lblid':    arrLblIdx,
                    'pathdb':   tpathLMDB
                }
    def getId(self):
        return self.dbId
    def toString(self):
        if self.isInitialized():
            tstr = '%s (%s)' % (self.cfg.getDBName(), self.getId())
        else:
            tstr = 'DatasetImage2dInfo is not initialized'
        return tstr
    def __str__(self):
        return self.toString()
    def __repr__(self):
        return self.toString()
    def getInfoStat(self):
        tshape=self.cfg.getImageShape()
        if self.sizeInBytesTrain > 0:
            tsizeTrainStr=utils.humanReadableSize(self.sizeInBytesTrain)
        else:
            tsizeTrainStr='???'
        if self.sizeInBytesVal > 0:
            tsizeValStr = utils.humanReadableSize(self.sizeInBytesVal)
        else:
            tsizeValStr = '???'
        if self.sizeInBytesTotal > 0:
            tsizeTotalStr = utils.humanReadableSize(self.sizeInBytesTotal)
        else:
            tsizeTotalStr = '???'
        tret = {
            'id'  : self.getId(),
            'type': self.cfg.getDBType(),
            'name': self.cfg.getDBName(),
            'info': self.cfg.getDBInfoJson(),
            'shape': {
                'channels': tshape[0],
                'width':    tshape[2],
                'height':   tshape[1],
            },
            'shapestr': '%dx%dx%d' % (tshape[2], tshape[1], tshape[0]),
            'size' : {
                'train' :   self.sizeInBytesTrain,
                'val':      self.sizeInBytesTrain,
                'total':    self.sizeInBytesTrain,
                'trainstr': tsizeTrainStr,
                'valstr':   tsizeValStr,
                'totalstr': tsizeTotalStr
            }
        }
        return tret
    def getInfoStatWithHists(self):
        tret=self.getInfoStat()
        tret['hist'] = self.cfg.getDBInfoHistsJson()
        return tret
    def getPreviewImageDataRaw(self):
        with open(self.pathPreview, 'r') as f:
            return f.read()
    def getMeanImageDataRaw(self):
        with open(self.pathMeanImage, 'r') as f:
            return f.read()
    def getRawImageFromDB(self, ptype, imdIdx):
        if ptype in self.dbIndex.keys():
            tdbIndex = self.dbIndex[ptype]
            pathLMDB = tdbIndex['pathdb']
            with lmdb.open(pathLMDB) as env:
                with env.begin(write=False) as  txn:
                    tidx = int(imdIdx)
                    tkey = tdbIndex['keys'][tidx]
                    timg = ImageTransformer2D.decodeLmdbItem2Image(txn.get(tkey))
                    strBuff = StringIO()
                    buffImg=Image.fromarray(timg)
                    buffImg.save(strBuff, format='JPEG')
                    return strBuff.getvalue()
    def getDbRangeInfo(self, ptype, labelIdx, idxFrom, idxTo):
        if ptype in self.dbIndex.keys():
            tdbIndex    = self.dbIndex[ptype]
            tmapIndex   = tdbIndex['map']
            tlabelIdx   = tdbIndex['lblid']
            tlblid      = int(labelIdx)
            if tlblid in tmapIndex.keys():
                retInfo = []
                for ii in range(idxFrom, idxTo):
                    tidx = tmapIndex[tlblid][ii]
                    tmp = {
                        'pos':  ii,
                        'info': self.labels[tlabelIdx[tidx]],
                        'idx':  tidx
                    }
                    retInfo.append(tmp)
                return retInfo

class DatasetsWatcher:
    dirDatasets=None
    dictDbInfo=[]
    def __init__(self, pathDir=None):
        if pathDir is None:
            dirRoot = app_flask.config['DLS_FILEMANAGER_BASE_PATH']
            self.dirDatasets = os.path.join(dirRoot, '../data/datasets')
        else:
            self.dirDatasets = pathDir
    def refreshDatasetsInfo(self):
        if os.path.isdir(self.dirDatasets):
            self.dictDbInfo={}
            lstDBDir = glob.glob('%s/dbset-*' % self.dirDatasets)
            for ii,pp in enumerate(lstDBDir):
                tmpDbInfo = DatasetImage2dInfo(pp)
                try:
                    tmpDbInfo.loadDBInfo()
                    self.dictDbInfo[tmpDbInfo.getId()] = tmpDbInfo
                except Exception as err:
                    print ('ERROR::DatasetsWatcher:refreshDatasetsInfo() DB [%s] is invalid \n\tmsg: %s' % (pp, err))
        else:
            raise Exception('Cant find directory with datasets [%s]' % self.dirDatasets)
    def toString(self):
        tstr = '%s' % self.dictDbInfo.values()
        return tstr
    def __str__(self):
        return self.toString()
    def __repr__(self):
        return self.toString()
    # api
    def getDatasetsInfoStatList(self):
        tret=[]
        for db in self.dictDbInfo.values():
            tret.append(db.getInfoStat())
        return tret
    def getDatasetsInfoStatWitHistsList(self):
        tret = []
        for db in self.dictDbInfo.values():
            tret.append(db.getInfoStatWithHists())
        return tret
    def getInfoStatAboutDB(self, dbId):
        if self.dictDbInfo.has_key(dbId):
            return self.dictDbInfo[dbId].getInfoStat()
    def getInfoStatWithHistsAboutDB(self, dbId):
        if self.dictDbInfo.has_key(dbId):
            return self.dictDbInfo[dbId].getInfoStatWithHists()
    def getPreviewImageDataRawForDB(self, dbId):
        if self.dictDbInfo.has_key(dbId):
            return self.dictDbInfo[dbId].getPreviewImageDataRaw()
    def getMeanImageRawForDB(self, dbId):
        if self.dictDbInfo.has_key(dbId):
            return self.dictDbInfo[dbId].getMeanImageDataRaw()
    def getRawImageFromDB(self, dbId, ptype, imdIdx):
        if self.dictDbInfo.has_key(dbId):
            return self.dictDbInfo[dbId].getRawImageFromDB(ptype, imdIdx)
    def getDbRangeInfo(self, dbId, ptype, labelIdx, idxFrom, idxTo):
        if self.dictDbInfo.has_key(dbId):
            return self.dictDbInfo[dbId].getDbRangeInfo(ptype, labelIdx, idxFrom, idxTo)

###############################
if __name__ == '__main__':
    pass
