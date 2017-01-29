#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import sys
import os
import numpy as np
import glob
import skimage.io as skio
import skimage.transform as sktf
import skimage.color as skcolor
import PIL.Image

import tensorflow as tf

####################################################
def _int64_feature(value):
  return tf.train.Feature(int64_list=tf.train.Int64List(value=[value]))

####################################################
def _bytes_feature(value):
  return tf.train.Feature(bytes_list=tf.train.BytesList(value=[value]))

####################################################
pathData='image-data.tfrecords'

####################################################
if __name__ == '__main__':
    lstfn=glob.glob('../../../../data-test/dataset-image2d/ecol*.jpg')
    outSize = (128,128)
    numImg = len(lstfn)
    writer = tf.python_io.TFRecordWriter(pathData)
    for ii,imgp in enumerate(lstfn):
        timg    = skio.imread(imgp).astype(np.float)
        timgr   = sktf.resize(timg, outSize)
        if timgr.ndim<3:
            timgr = skcolor.gray2rgb(timgr)
        print ('[%d/%d] : min/max = %0.3f/%0.3f' % (ii, numImg, timgr.min(), timgr.max()))
        tcol = timgr.shape[1]
        trow = timgr.shape[0]
        tnch = timgr.shape[2]
        timgRaw = timgr.tostring()
        texample = tf.train.Example(features = tf.train.Features(
            feature = {
                'height':   _int64_feature(tcol),
                'width':    _int64_feature(trow),
                'depth':    _int64_feature(tnch),
                'label':    _int64_feature(ii),
                'imagestr': _bytes_feature(timgRaw)
            }
        ))
        writer.write(texample.SerializeToString())
    writer.close()


