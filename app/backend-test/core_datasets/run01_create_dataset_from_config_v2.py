#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import sys
import glob

import numpy as np
import matplotlib.pyplot as plt
import skimage.io as skio

import app.backend.core.utils as dlsutils

from app.backend.core.datasets.dbbuilder import DBImage2DBuilder

#################################################
pathToDirWithJson="../../../data-test"
pathDirOutRoot="../../../data/datasets"

#################################################
if __name__ == '__main__':
    lstConfigFn=[os.path.abspath(xx) for xx in glob.glob('%s/dbconfig_*.json' % pathToDirWithJson)]
    prefixDataset='dbset'
    for ii,pp in enumerate(lstConfigFn):
        print ('[%d/%d] : %s' % (ii, len(lstConfigFn), pp))
        pathToJson = pp
        tdirDbId = dlsutils.getUniqueTaskId(prefixDataset)
        pathDirOut = os.path.abspath(os.path.join(pathDirOutRoot, tdirDbId))
        dlsutils.makeDirIfNotExists(pathDirOut)
        dbBuilder2DImage = DBImage2DBuilder(pathCfgInp=pathToJson,
                                        pathDirOut=pathDirOut)
        dbBuilder2DImage.initializeInfo()
        print (dbBuilder2DImage)
        dbBuilder2DImage.buildDataset(parProgressor=None)
        print ('\n\n')