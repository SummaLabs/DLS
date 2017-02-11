#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import sys
import glob

import skimage.io as skio

import numpy as np
import h5py

import tensorflow as tf

from run00_common import ImageDirParser, _float_feature, _bytes_feature, _int64_feature

##################################
if __name__ == '__main__':
    wdir = '../../dataset-image2d/simple4c_test'
    imgDirParser = ImageDirParser(wdir=wdir)
    print (imgDirParser)
    for ii in imgDirParser:
        texample0    = tf.train.Example()
        texampleList = tf.train.SequenceExample()
        tfeatureLists = tf.train.FeatureLists()
        for vvi,vv in enumerate(ii):
            tkey = 'col_%02d' % vvi
            ttype = imgDirParser.scheme[vvi]
            tx = texampleList.feature_lists.feature_list[tkey]
            if ttype == 'path-img2d':
                timg = skio.imread(vv)
                tfeature = tf.train.Feature(feature = {
                    'type': _bytes_feature(os.path.splitext(vv)[1]),
                    'nrow': _int64_feature(timg.shape[0]),
                    'ncol': _int64_feature(timg.shape[1]),
                    'ndim': _int64_feature(timg.ndim),
                    'raw':  _bytes_feature(timg.tostring())
                })
                # tdictFeatures[tkey] = tfeature
                # tx = tfeatureLists.feature_list[tkey]
                # tx = tfeature
                # print ('----')
            elif ttype == 'category-idx':
                tfeature = tf.train.Features(feature={
                    'idx':  _int64_feature(vv),
                    'name': _bytes_feature(imgDirParser.dictIdx2Name[vv])
                })
            elif ttype == 'array-float':
                tfeature = tf.train.Features(feature={
                    'val':  _bytes_feature(vv.tostring())
                })
            elif ttype == 'category-name':
                tfeature = tf.train.Features(feature={
                    'idx':  _int64_feature(imgDirParser.dictName2Idx[vv]),
                    'name': _bytes_feature(vv)
                })
            else:
                raise Exception('Unknown feature type [%s]' % ttype)
            #
            # tx = tfeatureLists.feature_list[tkey]
            tx = tfeature
            # texampleList.feature_lists.feature_list[tkey] = tx
        # texample = tf.train.Example(tfeatureLists)
        tmp = texampleList.SerializeToString()
        print (ii)
    #
    print ('-----')