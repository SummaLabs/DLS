#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import glob
from app.backend.core.utils import getDirectorySizeInBytes, humanReadableSize

if __name__ == '__main__':
    path='../../../data/datasets'
    for ii,pp in enumerate(glob.glob('%s/*' % path)):
        tbn=os.path.basename(pp)
        tsize = getDirectorySizeInBytes(pp)
        tsizeHuman = humanReadableSize(tsize)
        print ('[%d] %s : %s (%d)' % (ii, tbn, tsizeHuman, tsize))