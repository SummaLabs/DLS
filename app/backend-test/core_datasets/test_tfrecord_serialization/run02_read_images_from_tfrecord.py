#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import sys
import os
import numpy as np
import glob
import matplotlib.pyplot as plt

import tensorflow as tf
from run01_write_images_to_tfrecord import _bytes_feature, _int64_feature, pathData

####################################################
if __name__ == '__main__':
    lstImg = []
    for example in tf.python_io.tf_record_iterator(pathData):
        texample = tf.train.Example()
        texample.ParseFromString(example)
        ncol    = texample.features.feature['width'].int64_list.value[0]
        nrow    = texample.features.feature['height'].int64_list.value[0]
        nch     = texample.features.feature['depth'].int64_list.value[0]
        lbl     = texample.features.feature['label'].int64_list.value[0]
        imgraw  = texample.features.feature['imagestr'].bytes_list.value[0]
        timg    = np.reshape(np.frombuffer(imgraw, dtype=np.float), [nrow,ncol,nch])
        lstImg.append(timg)
        print ('... load image %s' % list(timg.shape))
    numImg = len(lstImg)
    plt.figure()
    for ii, timg in enumerate(lstImg):
        plt.subplot(1,numImg,ii+1)
        plt.imshow(timg.astype(np.uint8))
        plt.title('[%s]' % list(timg.shape))
    plt.show()
