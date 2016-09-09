#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import sys
import glob
import fnmatch
import numpy as np
import json
import lmdb
import matplotlib.pyplot as plt

import copy

import shutil
import skimage.io as skio

from app.backend.core.datasets.dbhelpers import \
    DBImageImportReader, DBImageImportReaderFromDir, DBImageImportReaderFromCSV, checkFilePath
from app.backend.core.datasets.dbconfig import DBImage2DConfig
from app.backend.core.datasets.dbbuilder import DBImage2DBuilder

#################################################
pathToJson="../../../data-test/dataset-image2d/example_dataset_cfg_csv_sep_relpath.json"
pathDirOut="../../../data-test/dataset-image2d/output-db"

#################################################
def test_main0():
    if not os.path.isdir(pathDirOut):
        os.mkdir(pathDirOut)
    cfgDB = DBImage2DConfig(pathToJson)
    print("TrainDir:      -->%s<--" % cfgDB.getTrainingDir())
    print("ValidationDir: -->%s<--" % cfgDB.getValidationDir())
    dataType = cfgDB.getImportDatasetType()
    if dataType == 'dir':
        imgReader = DBImageImportReaderFromDir(cfgDB)
    else:
        imgReader = DBImageImportReaderFromCSV(cfgDB)
    imgReader.precalculateInfo()
    print (imgReader)
    print ('-------------------------')

#################################################
if __name__ == '__main__':
    dbBuilder2DImage = DBImage2DBuilder(pathCfgInp=pathToJson,
                                        pathDirOut=pathDirOut)
    dbBuilder2DImage.initializeInfo()
    print (dbBuilder2DImage)
    dbBuilder2DImage.buildDataset(parProgressor=None)
