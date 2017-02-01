#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import skimage.io as skio
import numpy as np
import h5py

import time

import matplotlib.pyplot as plt

############################
from run00_common import ImageDirParser

############################
def test_read_data(wdir):
    imgDirParser = ImageDirParser(wdir=wdir)
    print (imgDirParser)
    #
    pathH5File = 'test-dataset.h5'
    f = h5py.File(pathH5File, 'r')
    dataScheme = f['scheme'].value
    grpData = f['data']
    meanImage = None
    meanArray = None
    meanArra2 = None
    numData = len(grpData)
    for kki, kk in enumerate(grpData.keys()):
        trow = grpData[kk]
        tcolumnNames = trow.keys()
        for ssi, ss in enumerate(dataScheme):
            tcolName = tcolumnNames[ssi]
            if ss == 'path-img2d':
                timg = trow[tcolName].value
                if meanImage is None:
                    meanImage = timg.astype(np.float)
                else:
                    meanImage += timg.astype(np.float)
            elif ss == 'array-float':
                tarr = trow[tcolName].value
                if meanArray is None:
                    meanArray = tarr
                    meanArra2 = tarr ** 2
                else:
                    meanArray += tarr
                    meanArra2 += tarr ** 2
    meanImage /= numData
    meanArray /= numData
    stdArray = np.sqrt(meanArra2 - meanArray ** 2)
    return (meanImage, meanArray, stdArray, numData)

############################
if __name__ == '__main__':
    wdir = '../../dataset-image2d/simple4c_test'
    numIter     = 10
    totNumData  = 0
    t0 = time.time()
    for ii in range(numIter):
        meanImage, meanArray, stdArray, numData = test_read_data(wdir)
        totNumData += numData
    dt = time.time() - t0
    speed = float()
    print (':: Test of h5 data-reading: #iter/#SamplesPerIter/#Total = %d/%d/%d ****\n'
           '\t\tTotalTime/TimePer(1000)Sample/Speed = %0.1fs/%0.3fs/%0.5f/'
           % (numIter, numData, totNumData, dt, 1000.*float(dt)/totNumData, float(totNumData)/dt))
    #
    plt.figure()
    plt.subplot(1, 2, 1)
    plt.imshow(meanImage.astype(np.uint8))
    plt.subplot(1, 2, 2)
    plt.hold(True)
    plt.plot(meanArray)
    plt.plot(stdArray)
    plt.legend(['mean', 'std'])
    plt.hold(False)
    plt.grid(True)
    plt.show()
