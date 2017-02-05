#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import skimage.io as skio
import numpy as np
import h5py
import time

from run00_common import ImageDirParser

############################
def buidImageDataset(imageDirParser=None, datasetName='test-dataset.h5', numberOfSamples=1000, isRawBlob = False):
    if imgDirParser is None:
        raise Exception('Invalid imageDirParser')
    pathH5File = datasetName
    f = h5py.File(pathH5File, 'w')
    f.create_dataset('scheme', data=np.array(imgDirParser.scheme))
    grpData = f.create_group('data')
    #
    rndIndex = np.random.randint(0, imgDirParser.getNumSamples(), (numberOfSamples))
    for ii in range(len(rndIndex)):
        ridx    = rndIndex[ii]
        dataRow = imgDirParser.listPathAndIdx[ridx]
        grpName = 'row_%08d' % ii
        grp = grpData.create_group(grpName)
        for vvi, vv in enumerate(dataRow):
            ttype = imgDirParser.scheme[vvi]
            tkey = 'col_%02d' % vvi
            if ttype == 'path-img2d':
                if isRawBlob:
                    timgData = np.void(open(vv, 'r').read())
                    dset = grp.create_dataset(tkey, data=timgData)
                else:
                    timg = skio.imread(vv)
                    dset = grp.create_dataset(tkey, data=timg)
            elif ttype == 'category-idx':
                dset = grp.create_dataset(tkey, data=np.array(vv))
            elif ttype == 'array-float':
                dset = grp.create_dataset(tkey, data=vv)
            elif ttype == 'category-name':
                dset = grp.create_dataset(tkey, data=np.array(vv))
            else:
                raise Exception('Unknown feature type [%s]' % ttype)
    f.close()


############################
if __name__ == '__main__':
    wdir = '../../dataset-image2d/simple4c_test'
    imgDirParser = ImageDirParser(wdir=wdir)
    print (imgDirParser)
    #
    numberOfSamples = 20000
    dataSetNameRaw = 'test-dataset-rawimg.h5'
    dataSetNameArr = 'test-dataset-numpy.h5'
    # (1) Raw
    t1 = time.time()
    buidImageDataset(imageDirParser=imgDirParser,
                     datasetName=dataSetNameRaw,
                     numberOfSamples=numberOfSamples, isRawBlob=True)
    dt = time.time() - t1
    tspeed = float(numberOfSamples) / dt
    dT1k = 1000. / tspeed
    print ('WRITE [%s] : T=%0.2fs, #Samples=%d, Speed: %0.3f (Samples/Sec), dt(#1000) = %0.3fs'
           % (dataSetNameRaw, dt, numberOfSamples, tspeed, dT1k))
    # (2) Numpy
    t1 = time.time()
    buidImageDataset(imageDirParser=imgDirParser,
                     datasetName=dataSetNameArr,
                     numberOfSamples=numberOfSamples, isRawBlob=False)
    dt = time.time() - t1
    tspeed = float(numberOfSamples) / dt
    dT1k = 1000. / tspeed
    print ('WRITE [%s] : T=%0.2fs, #Samples=%d, Speed: %0.3f (Samples/Sec), dt(#1000) = %0.3fs'
           % (dataSetNameArr, dt, numberOfSamples, tspeed, dT1k))
