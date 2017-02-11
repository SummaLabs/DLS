#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import sys
import glob

import numpy as np

import tensorflow as tf

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
if __name__ == '__main__':
    pass