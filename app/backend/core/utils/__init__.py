#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

from datetime import datetime
import shutil
import os
import sys
import glob
from app.backend.api import app_flask


#################################################
def getDirectorySizeInBytes(dirPath ='.'):
    """
    from http://stackoverflow.com/questions/1392413/calculating-a-directory-size-using-python
    reqursively calculate size of files in directory
    :param dirPath: directory path
    :return: size in bytes
    """
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(dirPath):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            total_size += os.path.getsize(fp)
    return total_size

def humanReadableSize(sizeInBytes):
    """
    from http://stackoverflow.com/questions/1392413/calculating-a-directory-size-using-python
    get size from bytes to human readable format
    :param sizeInBytes: siz in bytes
    :return: human readable string
    """
    B = "B"
    KB = "KB"
    MB = "MB"
    GB = "GB"
    TB = "TB"
    UNITS = [B, KB, MB, GB, TB]
    HUMANFMT = "%0.1f %s"
    HUMANRADIX = 1024.
    for u in UNITS[:-1]:
        if sizeInBytes < HUMANRADIX : return HUMANFMT % (sizeInBytes, u)
        sizeInBytes /= HUMANRADIX
    return HUMANFMT % (sizeInBytes,  UNITS[-1])

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
        os.makedirs(pathToDir)

def getPathForProjectDir():
    return app_flask.config['DLS_FILEMANAGER_BASE_PATH']

def getPathForDatasetDir():
    tdir = getPathForProjectDir()
    tret = os.path.abspath(os.path.join(tdir, '../data/datasets'))
    return tret

def getPathForModelsDir():
    tdir = getPathForProjectDir()
    tret = os.path.abspath(os.path.join(tdir, '../data/models'))
    return tret

if __name__ == '__main__':
    pass