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

import shutil
import skimage.io as skio

from flask import Flask

from app.backend.core.datasets.dbbuilder import DBImage2DBuilder

#################################################
pathToDirWithJson="../../../data-test"
pathDirOut="../../../data/datasets"

#################################################
if __name__ == '__main__':
    lstConfigFn=[os.path.abspath(xx) for xx in glob.glob('%s/dbconfig_*.json' % pathToDirWithJson)]
    for ii,pp in enumerate(lstConfigFn):
        print ('[%d/%d] : %s' % (ii, len(lstConfigFn), pp))
        pathToJson = pp
        dbBuilder2DImage = DBImage2DBuilder(pathCfgInp=pathToJson,
                                        pathDirOut=pathDirOut)
        dbBuilder2DImage.initializeInfo()
        print (dbBuilder2DImage)
        dbBuilder2DImage.buildDataset(parProgressor=None)
        print ('\n\n\n')