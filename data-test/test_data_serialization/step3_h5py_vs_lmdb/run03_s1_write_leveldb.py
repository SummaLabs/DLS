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
import plyvel

from run00_common import ImageDirParser, DataType

#################################
def buidImageDataset(imageDirParser=None, datasetType='lmdb', numberOfSamples=1000, isRawBlob=False):
    if imgDirParser is None:
        raise Exception('Invalid imageDirParser')
    rndIndex = np.random.randint(0, imgDirParser.getNumSamples(), (numberOfSamples))
    dataTypeBuilder = DataType()
    # (1) check dataset type and prepare write
    tpref = 'raw%d' % isRawBlob
    if datasetType == 'lmdb':
        dbfout = 'test-dataset-lmdb-%s' % tpref
        if os.path.isdir(dbfout):
            shutil.rmtree(dbfout)
        tsizInBytes = 24 * (1024 ** 3)
        lmdbEnv = lmdb.open(dbfout, map_size=tsizInBytes)
    elif datasetType == 'leveldb':
        dbfout = 'test-dataset-leveldb-%s' % tpref
        if os.path.isdir(dbfout):
            shutil.rmtree(dbfout)
        levelDB = leveldb.LevelDB(dbfout, create_if_missing=True)
    elif datasetType == 'tfrecord':
        dbfout = 'test-dataset-tf-%s.tfrecord' % tpref
        if os.path.isfile(dbfout):
            os.remove(dbfout)
        writer = tf.python_io.TFRecordWriter(dbfout)
    else:
        raise Exception('Unknown Dataset-Type [%s]' % datasetType)
    t0 = time.time()
    # (2) iterate over input data
    for ii in range(len(rndIndex)):
        ridx = rndIndex[ii]
        dataRow = imgDirParser.listPathAndIdx[ridx]
        grpName = 'row_%08d' % ii
        tfeatureDict = {}
        for vvi, vv in enumerate(dataRow):
            ttype = imgDirParser.scheme[vvi]
            if ttype == 'path-img2d':
                tcfg = {
                    'img': vv,
                    'fmt': 'raw' if isRawBlob else 'jpeg'
                }
            elif ttype == 'category-idx':
                tcfg = {
                    'idx': vv,
                    'name': imgDirParser.dictIdx2Name[vv],
                }
            elif ttype == 'category-name':
                tcfg = {
                    'idx': imgDirParser.dictName2Idx[vv],
                    'name': vv,
                }
            elif ttype == 'array-float':
                tcfg = {
                    'val': vv
                }
            else:
                raise Exception('Unknown feature type [%s]' % ttype)
            tdataType = dataTypeBuilder.getDataClassByName(ttype)
            # tfeatures = tdataType.data2Blob(tcfg)
            tfeatureDict.update(tdataType.data2Blob(tcfg))
            # print ('\t[%d] : %s' % (vvi, vv))
        texample = tf.train.Example(features = tf.train.Features(feature = tfeatureDict))
        if datasetType=='lmdb':
            with lmdbEnv.begin(write=True) as lmdbTxn:
                lmdbTxn.put(grpName.encode('ascii'), texample.SerializeToString())
            # lmdbTxn.commit()
        elif datasetType=='leveldb':
            levelDB.Put(grpName.encode('ascii'), texample.SerializeToString())
        else:
            writer.write(texample.SerializeToString())
        # print('[%d] : %s' % (ii, grpName))
    if datasetType == 'lmdb':
        lmdbEnv.close()
    elif datasetType == 'lmdb':
        levelDB = None
    elif datasetType=='tfrecord':
        writer.close()
    dt = time.time() - t0
    return dt

#################################
if __name__ == '__main__':
    wdir = '../../dataset-image2d/simple4c_test'
    imgDirParser = ImageDirParser(wdir=wdir)
    print (imgDirParser)
    numberOfSamples = 10000
    lstOpt_Raw = [False, True]
    # lstOpt_Dbt = ['lmdb', 'tfrecord']
    lstOpt_Dbt = ['leveldb', 'lmdb']
    for opRaw in lstOpt_Raw:
        for opBdt in lstOpt_Dbt:
            tdt = buidImageDataset(imgDirParser, numberOfSamples=numberOfSamples, datasetType=opBdt, isRawBlob=opRaw)
            tspeed = float(numberOfSamples) / tdt
            dT1k = 1000. / tspeed
            print ('WRITE [%s : isRaw = %d] : T=%0.2fs, #Samples=%d, Speed: %0.3f (Samples/Sec), dt(#1000) = %0.3fs'
               % (opBdt, opRaw, tdt, numberOfSamples, tspeed, dT1k))
    # tmp = DataType.getDataClassByName(strType=DataType_Image2D.type())
    print ('----')

