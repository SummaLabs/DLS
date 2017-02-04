#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'ar'

import os
import sys

import skimage.io as skio
import numpy as np
import h5py
import time

import time
import matplotlib.pyplot as plt

try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO

from run00_common import ImageDirParser

############################
def readImageDataset(pathDataset='test-dataset.h5', isRawBlob = False):
    if not os.path.isfile(pathDataset):
        raise Exception('Cant find dataset file [%s]' % pathDataset)
    f = h5py.File(pathDataset, 'r')
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
                if isRawBlob:
                    tdata = trow[tcolName].value
                    timg = skio.imread(StringIO(tdata.tostring()))
                else:
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

def readImageDatasetFromDisk(imgDirParser=None, numberOfSamples=1000):
    if imgDirParser is None:
        raise Exception('Invalid imageDirParser')
    meanImage = None
    rndIndex = np.random.randint(0, imgDirParser.getNumSamples(), (numberOfSamples))
    for ii in range(len(rndIndex)):
        ridx = rndIndex[ii]
        dataRow = imgDirParser.listPathAndIdx[ridx]
        for vvi, vv in enumerate(dataRow):
            ttype = imgDirParser.scheme[vvi]
            if ttype == 'path-img2d':
                timg = skio.imread(vv)
                if meanImage is None:
                    meanImage = timg.astype(np.float)
                else:
                    meanImage += timg.astype(np.float)
            else:
                pass
                # raise Exception('Unknown feature type [%s]' % ttype)
    meanImage /= numberOfSamples
    return meanImage

############################
if __name__ == '__main__':
    wdir = '../../dataset-image2d/simple4c_test'
    imgDirParser = ImageDirParser(wdir=wdir)
    print (imgDirParser)
    #
    dataSetNameRaw = 'test-dataset-rawimg.h5'
    dataSetNameArr = 'test-dataset-numpy.h5'
    # (1) Raw
    t1 = time.time()
    (meanImage1, meanArray1, stdArray1, numData1) = readImageDataset(pathDataset=dataSetNameRaw, isRawBlob=True)
    dT1 = time.time() - t1
    tspeed1 = float(numData1) / dT1
    dT1_1k = 1000. / tspeed1
    print ('READ [%s] : T=%0.2fs, #Samples=%d, Speed: %0.3f (Samples/Sec), dt(#1000) = %0.3fs'
           % (dataSetNameRaw, dT1, numData1, tspeed1, dT1_1k))
    # (2) Numpy
    t2 = time.time()
    (meanImage2, meanArray2, stdArray2, numData2) = readImageDataset(pathDataset=dataSetNameArr, isRawBlob=False)
    dT2 = time.time() - t2
    tspeed2 = float(numData2) / dT2
    dT2_1k = 1000. / tspeed2
    print ('READ [%s] : T=%0.2fs, #Samples=%d, Speed: %0.3f (Samples/Sec), dt(#1000) = %0.3fs'
           % (dataSetNameArr, dT2, numData2, tspeed2, dT2_1k))
    # (3) Fom file
    t3 = time.time()
    meanImage3 = readImageDatasetFromDisk(imgDirParser=imgDirParser, numberOfSamples=numData2)
    dT3 = time.time() - t3
    tspeed3 = float(numData2) / dT3
    dT3_1k = 1000. / tspeed3
    print ('READ [%s] : T=%0.2fs, #Samples=%d, Speed: %0.3f (Samples/Sec), dt(#1000) = %0.3fs'
           % ('FROM FILES', dT3, numData2, tspeed3, dT3_1k))
    #
    # plt.figure()
    # plt.subplot(2, 2, 1)
    # plt.imshow(meanImage1.astype(np.uint8))
    # plt.title('RAW-image')
    # plt.subplot(2, 2, 2)
    # plt.hold(True)
    # plt.plot(meanArray1)
    # plt.plot(stdArray1)
    # plt.legend(['mean', 'std'])
    # plt.hold(False)
    # plt.grid(True)
    # plt.title('RAW-array')
    # #
    # plt.subplot(2, 2, 3)
    # plt.imshow(meanImage2.astype(np.uint8))
    # plt.title('Numpy-image')
    # plt.subplot(2, 2, 4)
    # plt.hold(True)
    # plt.plot(meanArray2)
    # plt.plot(stdArray2)
    # plt.legend(['mean', 'std'])
    # plt.hold(False)
    # plt.grid(True)
    # plt.title('Numpy-array')
    # plt.show()