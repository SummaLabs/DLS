#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'ar'

import os
import time
import lmdb
import tensorflow as tf
import numpy as np
import shutil

import leveldb
import matplotlib.pyplot as plt

from run00_common import ImageDirParser, DataType

#################################
def readImageDatasetLMDB(imageDirParser=None, numberOfSamples=1000, isRawBlob=False):
    if imgDirParser is None:
        raise Exception('Invalid imageDirParser')
    rndIndex = np.random.randint(0, imgDirParser.getNumSamples(), (numberOfSamples))
    dataTypeBuilder = DataType()
    # (1) check dataset type and prepare write
    tpref = 'raw%d' % isRawBlob
    dbfout = 'test-dataset-lmdb-%s' % tpref
    if not os.path.isdir(dbfout):
        raise Exception('Cant find LMDB dataset [%s]' % dbfout)
    tsizInBytes = 4 * (1024 ** 3)
    lmdbEnv = lmdb.open(dbfout, map_size=tsizInBytes)
    t0 = time.time()
    meanImage = None
    meanArray = None
    meanArra2 = None
    schemeOfFeatures = None
    with lmdbEnv.begin(write=False) as lmdbTxn:
        lstKeys = [key for key, _ in lmdbTxn.cursor()]
        rndIndex = np.random.randint(len(lstKeys), size=numberOfSamples)
        for ii, ridx in enumerate(rndIndex):
            tkey = lstKeys[ridx]
            texampleStr = lmdbTxn.get(tkey)
            texample = tf.train.Example()
            texample.ParseFromString(texampleStr)
            tfeatures = texample.features._fields.values()[0]
            # (1) Prepare scheme for dataset row-sample
            if schemeOfFeatures is None:
                d1 = {ss: ss.split('.') for ss in tfeatures.keys()}
                schemeOfFeatures = {}
                for kk,vv in d1.items():
                    if not schemeOfFeatures.has_key(vv[0]):
                        schemeOfFeatures[vv[0]] = {}
                    tk = vv[1]
                    schemeOfFeatures[vv[0]][tk] = kk
            # (2) iterate over scheme-data-types
            for ttypeStr,vv in schemeOfFeatures.items():
                tdataTypeObj = dataTypeBuilder.getDataClassByName(ttypeStr)
                cfg = {k2:tfeatures.pop(v2) for k2,v2 in vv.items()}
                tret = tdataTypeObj.blob2Data(cfg)
                #
                if ttypeStr == 'path-img2d':
                    if meanImage is None:
                        meanImage = tret['img'].copy().astype(np.float)
                    else:
                        meanImage += tret['img'].copy().astype(np.float)
                elif ttypeStr == 'array-float':
                    tarr = tret['val'].copy()
                    if meanArray is None:
                        meanArray = tarr
                        meanArra2 = tarr ** 2
                    else:
                        meanArray += tarr
                        meanArra2 += tarr ** 2
        numData = len(lstKeys)
        meanImage /= numData
        meanArray /= numData
        stdArray = np.sqrt(meanArra2 - meanArray ** 2)
    dt = time.time() - t0
    return (dt, meanImage, meanArray, stdArray, numData)

#################################
def readImageDatasetLevelDB(imageDirParser=None, numberOfSamples=1000, isRawBlob=False):
    if imgDirParser is None:
        raise Exception('Invalid imageDirParser')
    rndIndex = np.random.randint(0, imgDirParser.getNumSamples(), (numberOfSamples))
    dataTypeBuilder = DataType()
    # (1) check dataset type and prepare write
    tpref = 'raw%d' % isRawBlob
    dbfout = 'test-dataset-leveldb-%s' % tpref
    if not os.path.isdir(dbfout):
        raise Exception('Cant find LMDB dataset [%s]' % dbfout)
    levelDB = leveldb.LevelDB(dbfout)
    t0 = time.time()
    meanImage = None
    meanArray = None
    meanArra2 = None
    schemeOfFeatures = None
    lstKeys = [key for key in levelDB.RangeIter(include_value=False)]
    # lstKeys = [key for key, _ in lmdbTxn.cursor()]
    rndIndex = np.random.randint(len(lstKeys), size=numberOfSamples)
    for ii, ridx in enumerate(rndIndex):
        tkey = lstKeys[ridx]
        texampleStr = levelDB.Get(tkey)
        texample = tf.train.Example()
        texample.ParseFromString(texampleStr)
        tfeatures = texample.features._fields.values()[0]
        # (1) Prepare scheme for dataset row-sample
        if schemeOfFeatures is None:
            d1 = {ss: ss.split('.') for ss in tfeatures.keys()}
            schemeOfFeatures = {}
            for kk,vv in d1.items():
                if not schemeOfFeatures.has_key(vv[0]):
                    schemeOfFeatures[vv[0]] = {}
                tk = vv[1]
                schemeOfFeatures[vv[0]][tk] = kk
        # (2) iterate over scheme-data-types
        for ttypeStr,vv in schemeOfFeatures.items():
            tdataTypeObj = dataTypeBuilder.getDataClassByName(ttypeStr)
            cfg = {k2:tfeatures.pop(v2) for k2,v2 in vv.items()}
            tret = tdataTypeObj.blob2Data(cfg)
            #
            if ttypeStr == 'path-img2d':
                if meanImage is None:
                    meanImage = tret['img'].copy().astype(np.float)
                else:
                    meanImage += tret['img'].copy().astype(np.float)
            elif ttypeStr == 'array-float':
                tarr = tret['val'].copy()
                if meanArray is None:
                    meanArray = tarr
                    meanArra2 = tarr ** 2
                else:
                    meanArray += tarr
                    meanArra2 += tarr ** 2
    numData = len(lstKeys)
    meanImage /= numData
    meanArray /= numData
    stdArray = np.sqrt(meanArra2 - meanArray ** 2)
    dt = time.time() - t0
    return (dt, meanImage, meanArray, stdArray, numData)

#################################
if __name__ == '__main__':
    wdir = '../../dataset-image2d/simple4c_test'
    imgDirParser = ImageDirParser(wdir=wdir)
    print (imgDirParser)
    lstOpt_Raw = [False, True]
    lstOpt_Bdt = ['lmdb', 'leveldb']
    for opBdt in lstOpt_Bdt:
        for opRaw in lstOpt_Raw:
            if opBdt == 'leveldb':
                (tdt, meanImage, meanArray, stdArray, numberOfSamples) = readImageDatasetLevelDB(imgDirParser, isRawBlob=opRaw)
            elif opBdt == 'lmdb':
                (tdt, meanImage, meanArray, stdArray, numberOfSamples) = readImageDatasetLMDB(imgDirParser, isRawBlob=opRaw)
            else:
                raise Exception('Fuck...')
            tspeed = float(numberOfSamples) / tdt
            dT1k = 1000. / tspeed
            print ('READ [%s : isRaw = %d] : T=%0.2fs, #Samples=%d, Speed: %0.3f (Samples/Sec), dt(#1000) = %0.3fs'
                   % (opBdt, opRaw, tdt, numberOfSamples, tspeed, dT1k))
            plt.figure()
            plt.imshow((255.*meanImage/meanImage.max()).astype(np.uint8))
            plt.title('#Samples = %d' % numberOfSamples)
            plt.show(block=False)
    plt.show()
