#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import sys
import glob
import time

import abc

import lmdb
import tensorflow as tf
import numpy as np
import skimage.io as skio
import PIL.Image
import shutil

try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO

##################################
class ImageDirParser:
    wdir     = None
    scheme   = None
    lblNames = None
    lblIdx   = None
    dictIdx2Name = None
    dictName2Idx = None
    dictIdx2Path = None
    listPathAndIdx = None
    def __init__(self, wdir=None):
        if wdir is not None:
            self.loadInfoFromDir(wdir)
    def loadInfoFromDir(self, wdir, imgExts=('png', 'jpg')):
        if not os.path.isdir(wdir):
            raise Exception('Cant find directiry [%s]' % wdir)
        self.wdir = os.path.abspath(wdir)
        tlstDir = glob.glob('%s/*' % self.wdir)
        if len(tlstDir)<1:
            raise Exception("I think, that directory is empry! [%s]" % self.wdir)
        tlstSubDir = [xx  for xx in tlstDir if os.path.isdir(xx)]
        if len(tlstSubDir)<2:
            raise Exception('Cant find subdirectories in folder [%s], if number of subdirectories is too small [%d]. Need min 2!'
                            % (self.wdir, len(tlstSubDir)))
        self.lblNames   = []
        self.lblIdx     = []
        self.dictName2Idx   = {}
        self.dictIdx2Name   = {}
        for ii,pp in enumerate(tlstSubDir):
            tlbl = os.path.basename(pp)
            self.lblNames.append(tlbl)
            self.lblIdx.append(ii)
            self.dictIdx2Name[ii] = tlbl
            self.dictName2Idx[tlbl] = ii
        self.dictIdx2Path = {xx:[] for xx in self.lblIdx}
        for ii in self.lblIdx:
            tdirName = self.dictIdx2Name[ii]
            tlstPathImg = []
            for ee in imgExts:
                tregExpExt = '%s/%s/*.%s' % (self.wdir, tdirName, ee)
                tlstExt = glob.glob(tregExpExt)
                tlstPathImg.extend(tlstExt)
            if len(tlstPathImg)<1:
                raise Exception('Cant find images in directory [%s/%s] with patterns [%s]' % (self.wdir, tdirName, imgExts))
            self.dictIdx2Path[ii] = sorted(tlstPathImg)
        self.listPathAndIdx = [(pp,kk, np.random.randn(5), self.dictIdx2Name[kk]) for kk,vv in self.dictIdx2Path.items() for pp in vv]
        self.scheme = [
            'path-img2d',
            'category-idx',
            'array-float',
            'category-name'
        ]
        self.currentPos = 0
        self.numIter = len(self.listPathAndIdx)
        print (self.dictIdx2Name)
    def clean(self):
        self.wdir       = None
        self.lblIdx     = None
        self.lblNames   = None
        self.dictIdx2Name   = None
        self.dictName2Idx   = None
    def isInitialized(self):
        return (self.wdir is not None) and (self.dictIdx2Name is not None)
    def getNumSamples(self):
        if self.isInitialized():
            return len(self.listPathAndIdx)
        else:
            return 0
    def toString(self):
        if not self.isInitialized():
            return 'ImageDirParser not initialized yet...'
        else:
            tnum = self.getNumSamples()
            tstr = ['%s: %s (%d)' % (kk, self.dictIdx2Name[kk], len(vv)) for kk,vv in self.dictIdx2Path.items()]
            return 'ImageDirParser(%d) %s' % (tnum, tstr)
    def __str__(self):
        return self.toString()
    def __repr__(self):
        return self.toString()
    # Iterator:
    def __iter__(self):
        if not self.isInitialized():
            raise Exception('ImageDirParser not initialized yet')
        self.currentPos = 0
        self.numIter = len(self.listPathAndIdx)
        return self
    def next(self):
        if self.currentPos < self.numIter:
            self.currentPos +=1
            return self.listPathAndIdx[self.currentPos-1]
        else:
            raise StopIteration

##################################
def _int64_feature(value):
    return tf.train.Feature(int64_list=tf.train.Int64List(value=[value]))

def _float_feature(value):
    return tf.train.Feature(int64_list=tf.train.FloatList(value=[value]))

def _bytes_feature(value):
    return tf.train.Feature(bytes_list=tf.train.BytesList(value=[value]))

##################################
class DataType:
    __metaclass__ = abc.ABCMeta
    dictTypes=None
    @staticmethod
    def getDataClassByNameStatic(strType='unknown'):
        # get_class = lambda x: globals()[x]
        lstDataTypes=[DataType_LabelIdx, DataType_LabelName, DataType_Image2D, DataType_ArrayFloat]
        for ii in lstDataTypes:
            if ii.type()==strType:
                return ii()
        raise Exception('Unknown Data Type Name [%s]' % strType)
    def getDataClassByName(self, strType='unknown'):
        if self.dictTypes is None:
            self.dictTypes = {}
            lstDataTypes = [DataType_LabelIdx, DataType_LabelName, DataType_Image2D, DataType_ArrayFloat]
            for ii in lstDataTypes:
                self.dictTypes[ii.type()] = ii
        if strType in self.dictTypes.keys():
            return self.dictTypes[strType]()
        else:
            raise Exception('Unknown Data Type Name [%s]' % strType)
    @staticmethod
    def type():
        return 'unknown'
    # @abc.abstractmethod
    def data2Blob(self, dataDict=None):
        pass
    # @abc.abstractmethod
    def blob2Data(self, blobDict=None):
        pass

#################################
class DataType_LabelIdx(DataType):
    @staticmethod
    def type():
        return 'category-idx'
    def data2Blob(self, dataDict=None):
        tidx  = dataDict['idx']
        tname = dataDict['name']
        return {
            '%s.idx' % self.type() : _int64_feature(tidx),
            '%s.name' % self.type() : _bytes_feature(tname)
        }
    def blob2Data(self, blobDict=None):
        return {
            'idx': blobDict['idx'].int64_list.value[0],
            'name': blobDict['name'].bytes_list.value[0]
        }

#################################
class DataType_LabelName(DataType):
    @staticmethod
    def type():
        return 'category-name'
    def data2Blob(self, dataDict=None):
        tidx = dataDict['idx']
        tname = dataDict['name']
        return {
            '%s.idx' % self.type() : _int64_feature(tidx),
            '%s.name' % self.type() : _bytes_feature(tname)
        }
    def blob2Data(self, blobDict=None):
        return {
            'idx': blobDict['idx'].int64_list.value[0],
            'name': blobDict['name'].bytes_list.value[0],
        }

class DataType_Image2D(DataType):
    @staticmethod
    def type():
        return 'path-img2d'
    def data2Blob(self, dataDict=None):
        timg = dataDict['img']
        tfmt = dataDict['fmt']
        tnpType = 'none'
        if isinstance(timg,str) or isinstance(timg,unicode):
            timg = skio.imread(timg)
        else:
            pass
        trow = timg.shape[0]
        tcol = timg.shape[1]
        tnch = 1
        if len(timg.shape)>2:
            tnch = timg.shape[2]
        if tfmt=='raw':
            timg = timg.astype(np.float32)
            tnpType = timg.dtype.name
            tdata = timg.tostring()
        else:
            timgPIL = PIL.Image.fromarray(timg.astype(np.uint8))
            tbuff = StringIO()
            if tfmt=='jpeg':
                timgPIL.save(tbuff, format='jpeg')
            elif tfmt=='png':
                timgPIL.save(tbuff, format='png')
            else:
                raise Exception('Unknown format [%s]' % tfmt)
            tdata = tbuff.getvalue()
        return {
            '%s.row' % self.type(): _int64_feature(trow),
            '%s.col' % self.type(): _int64_feature(tcol),
            '%s.nch' % self.type(): _int64_feature(tnch),
            '%s.fmt' % self.type(): _bytes_feature(tfmt),
            '%s.npt' % self.type(): _bytes_feature(tnpType),
            '%s.raw' % self.type(): _bytes_feature(tdata)
        }
    def blob2Data(self, blobDict=None):
        tfmt = blobDict['fmt'].bytes_list.value[0]
        if tfmt=='raw':
            trow = blobDict['row'].int64_list.value[0]
            tcol = blobDict['col'].int64_list.value[0]
            tnch = blobDict['nch'].int64_list.value[0]
            tnpt = np.dtype(blobDict['npt'].bytes_list.value[0])
            timg = np.frombuffer(blobDict['raw'].bytes_list.value[0], tnpt)
            if tnch==1:
                timg = timg.reshape((trow, tcol))
            else:
                timg = timg.reshape((trow, tcol, tnch))
        else:
            timg = skio.imread(StringIO(blobDict['raw'].bytes_list.value[0]))
        return {
            'img': timg,
            'fmt': tfmt
        }

class DataType_ArrayFloat(DataType):
    @staticmethod
    def type():
        return 'array-float'
    def data2Blob(self, dataDict=None):
        tval = dataDict['val']
        return {
            '%s.val' % self.type() : _bytes_feature(tval.tostring())
        }
    def blob2Data(self, blobDict=None):
        return {
            'val': np.frombuffer(blobDict['val'].bytes_list.value[0], np.float)
        }

#################################
if __name__ == '__main__':
    pass