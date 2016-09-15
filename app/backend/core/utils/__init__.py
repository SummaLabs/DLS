#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

from datetime import datetime
import shutil
import os
import sys
import glob

#################################################
def getUniqueTaskId(prefix=None):
    """
    unique id generator for varius DLS tasks
    :param prefix: prefix for task type
    :return: unique string index (list of indexes can be sorted by date)
    """
    tidx = datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    if prefix is not None:
        tret = '%s-%s' % (prefix, tidx)
    else:
        tret = tidx
    return tret

def makeDirIfNotExists(pathToDir, isCleanIfExists=True):
    """
    create directory if directory is absent
    :param pathToDir: path to directory
    :param isCleanIfExists: flag: clean directory if directory exists
    :return: None
    """
    if os.path.isdir(pathToDir) and isCleanIfExists:
        shutil.rmtree(pathToDir)
    if not os.path.isdir(pathToDir):
        os.mkdir(pathToDir)


if __name__ == '__main__':
    pass