#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os

def getListDirNamesInDir(pathDir):
    ret = [os.path.basename(x) for x in os.listdir(pathDir) if os.path.isdir(os.path.join(pathDir,x))]
    return ret

def getListImagesInDirectory(pathDir, pext=('.jpg', '.jpeg', '.JPG', '.JPEG', '.png', '.PNG', '.bmp', '.BMP')):
    ret = [os.path.join(pathDir,x) for x in os.listdir(pathDir) if (os.path.isfile(os.path.join(pathDir,x)) and x.endswith(pext))]
    return ret


def checkFilePath(path, isDirectory=False):
    if not isDirectory:
        tcheck = os.path.isfile(path)
    else:
        tcheck = os.path.isdir(path)
    if not tcheck:
        if not isDirectory:
            tstrErr = "Cant find file [%s]" % path
        else:
            tstrErr = "Cant find directory [%s]" % path
        raise Exception(tstrErr)

def calcNumImagesByLabel(lstLabel, mapImagePath):
    ret={}
    for ii in lstLabel:
        if mapImagePath.has_key(ii):
            ret[ii] = len(mapImagePath[ii])
        else:
            ret[ii] = 0
    return ret

if __name__ == '__main__':
    pass