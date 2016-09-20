import os
import sys
import glob

from flask import Flask, Blueprint
from flask import request, Response, make_response
from flask import render_template
from flask import send_from_directory
from app.backend.api import app_flask
from app.backend.core import utils

from app.backend.file_manager.api import getRealPathFromFMUrlPath, validateSeverPathFromUrlPath
from dbbuilder import DBImage2DBuilder, DBImage2DConfig
from imgproc2d import ImageTransformer2D

import json
import time
import lmdb

try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO

import dlscaffe.caffedls_pb2 as dlscaffe_pb2
from PIL import Image
import skimage.io as skio

dbpreview = Blueprint(__name__, __name__)

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
    def loadDBInfo(self):
        if self.checkIsAValidImage2dDir():
            self.cfg = DBImage2DConfig(self.pathConfig)
            if not self.cfg.isInitialized():
                strErr = 'Invalid DB config JSON file [%s]' % self.pathConfig
                raise Exception(strErr)
            try:
                self.sizeInBytesTrain   = utils.getDirectorySizeInBytes(self.pathDbTrain)
                self.sizeInBytesVal     = utils.getDirectorySizeInBytes(self.pathDbVal)
                self.sizeInBytesTotal   = self.sizeInBytesTrain+self.sizeInBytesVal
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
    def getRawImageFromDB(self, ptype, imdIdx, classType=None):
        pathLMDB = self.pathDbTrain
        if ptype == 'val':
            pathLMDB = self.pathDbVal
        with lmdb.open(pathLMDB) as env:
            with env.begin(write=False) as  txn:
                lstKeys = [key for key, _ in txn.cursor()]
                timg = ImageTransformer2D.decodeLmdbItem2Image(txn.get(lstKeys[int(imdIdx)]))
                strBuff = StringIO()
                buffImg=Image.fromarray(timg)
                buffImg.save(strBuff, format='JPEG')
                return strBuff.getvalue()
    def getDbRangeInfo(self, ptype, idxFrom, idxTo):
        pathLMDB = self.pathDbTrain
        if ptype == 'val':
            pathLMDB = self.pathDbVal
        retInfo=[]
        for ii in range(idxFrom, idxTo):
            with lmdb.open(pathLMDB) as env:
                with env.begin(write=False) as  txn:
                    lstKeys = [key for key, _ in txn.cursor()]
                    tdat = dlscaffe_pb2.Datum()
                    tdat.ParseFromString(txn.get(lstKeys[ii]))
                    tmp = {
                        'pos': ii,
                        'info' : self.cfg.cfg["dbhist"]["labels"][tdat.label],
                        'idx': ii
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
    def getRawImageFromDB(self, dbId, ptype, imdIdx, classType=None):
        if self.dictDbInfo.has_key(dbId):
            return self.dictDbInfo[dbId].getRawImageFromDB(ptype, imdIdx, classType)
    def getDbRangeInfo(self, dbId, ptype, idxFrom, idxTo):
        if self.dictDbInfo.has_key(dbId):
            return self.dictDbInfo[dbId].getDbRangeInfo(ptype, idxFrom, idxTo)

###############################
datasetWatcher              = DatasetsWatcher()
datasetWatcher.refreshDatasetsInfo()
#FIXME: only for DEBUG!
if len(datasetWatcher.dictDbInfo.keys())<1:
    print ('!!! WARNING !!!! Datasets not found! Please prepare datasets:\n\tjust run script: $DLS_GIT_ROOT/data-test/run01-create-test-DLS-datasets.sh')
else:
    print ('\nAvailable datasets: ')
    for ii,db in enumerate(datasetWatcher.dictDbInfo.values()):
        print ('%d : %s' % (ii, db))

###############################
@dbpreview.route('/dbinfolist/', methods=['GET', 'POST'])
def dbpreview_db_infolist():
    jsonData = json.dumps(datasetWatcher.getDatasetsInfoStatList())
    return Response(jsonData, mimetype='application/json')

@dbpreview.route('/dbinfo/<string:dbid>', methods=['GET', 'POST'])
def dbpreview_db_info(dbid):
    jsonData = json.dumps(datasetWatcher.getInfoStatAboutDB(dbid))
    return Response(jsonData, mimetype='application/json')

@dbpreview.route('/dbinfohist/<string:dbid>', methods=['GET', 'POST'])
def dbpreview_db_infohist(dbid):
    jsonData = json.dumps(datasetWatcher.getInfoStatWithHistsAboutDB(dbid))
    return Response(jsonData, mimetype='application/json')

@dbpreview.route('/dbimgpreview/<string:dbid>', methods=['GET', 'POST'])
def dbpreview_db_imgpreview(dbid):
    try:
        tdata = datasetWatcher.getPreviewImageDataRawForDB(dbid)
    except Exception as err:
        tdata = None
        print (err)
    return tdata

@dbpreview.route('/dbimgmean/<string:dbid>', methods=['GET', 'POST'])
def dbpreview_db_imgmean(dbid):
    try:
        tdata = datasetWatcher.getMeanImageRawForDB(dbid)
    except Exception as err:
        tdata = None
        print (err)
    return tdata

@dbpreview.route('/getdbimgdata/<string:dbid>/<string:ptype>/<string:imgidx>', methods=['GET', 'POST'])
def dbpreview_db_imgfromdb(dbid, ptype, imgidx):
    try:
        tdata = datasetWatcher.getRawImageFromDB(dbid, ptype, imgidx)
    except Exception as err:
        tdata = None
        print (err)
    return tdata

@dbpreview.route('/dbrangeinfo/', methods=['GET', 'POST'])
def dataset_dbrangeinfo():
    dbid   = request.args['dbid']
    dbtype = request.args['dbtype']
    tfrom = int(request.args['from'])
    tto   = int(request.args['to'])
    tret  = datasetWatcher.getDbRangeInfo(dbid,dbtype, tfrom, tto)
    # tret  = []
    # for xx in range(tfrom,tto):
    #     tret.append(tmp[xx])
    return Response(json.dumps(tret), mimetype='application/json')

###############################
class DatasetForTests:
    wdir=None
    mapUrl=None
    def __init__(self, pathRoot):
        if not os.path.isdir(pathRoot):
            strError = 'Cant find directory [%s]' % pathRoot
            print (strError)
            self.mapUrl = {}
            return
            # raise Exception()
        self.wdir = os.path.abspath(pathRoot)
        tlstDir=[os.path.basename(xx) for xx in glob.glob('%s/*' % self.wdir) if os.path.isdir(xx)]
        self.mapUrl = {}
        for dd in tlstDir:
            tmp = [ {'pos': ii, 'info' : dd, 'idx': '%s/%s' % (dd,os.path.basename(xx))} for ii,xx in enumerate(glob.glob('%s/%s/*.jpg' % (self.wdir,dd)))]
            self.mapUrl[dd] = tmp
        tmpApp = []
        for vv in self.mapUrl.values():
            tmpApp += vv
        self.mapUrl['all'] = tmpApp
        # for ii,vv in enumerate(self.mapUrl.values()):
        #     print ('%d : %s' % (ii, vv[0]))
    def getInfo(self):
        tret={}
        for kk,vv in self.mapUrl.items():
            tret[kk] = len(vv)
        return tret
    def getImageSrcFromDataset(self, imgIdx):
        tpath = os.path.join(self.wdir, imgIdx)
        if not os.path.isfile(tpath):
            raise Exception('Cant find image [%s]' % tpath)
        with open(tpath, 'rb') as f:
            return f.read()

###############################
# Only for tests API: must be deleted in feature
dataSetProviderOnlyForTests = DatasetForTests(os.path.abspath('data-test/dataset-image2d/simple4c_test'))

@dbpreview.route('/datasetinfo/', methods=['GET', 'POST'])
def dataset_info():
    jsonData = json.dumps(dataSetProviderOnlyForTests.getInfo())
    return Response(jsonData, mimetype='application/json')

@dbpreview.route('/datasetrange/', methods=['GET', 'POST'])
def dataset_range():
    dbid  = request.args['dbid']
    tfrom = int(request.args['from'])
    tto   = int(request.args['to'])
    tmp   = dataSetProviderOnlyForTests.mapUrl[dbid]
    tret  = []
    for xx in range(tfrom,tto):
        tret.append(tmp[xx])
    return Response(json.dumps(tret), mimetype='application/json')

@dbpreview.route('/getimgdata/<path:imageid>')
def get_image_data(imageid):
    try:
        tdata = dataSetProviderOnlyForTests.getImageSrcFromDataset(imageid)
    except Exception as err:
        tdata = None
        print (err)
    return tdata

###############################
@dbpreview.route('/getserverpath/<path:ppath>', methods=['GET', 'POST'])
def get_server_path(ppath):
    return getRealPathFromFMUrlPath(ppath)

@dbpreview.route('/checkpath/<path:ppath>', methods=['GET', 'POST'])
def check_server_path(ppath):
    tmp = validateSeverPathFromUrlPath(ppath)
    tret = {
        'isdir':  tmp[0],
        'isfile': tmp[1]
    }
    return Response(json.dumps(tret), mimetype='application/json')

###############################
if __name__ == '__main__':
    pass
