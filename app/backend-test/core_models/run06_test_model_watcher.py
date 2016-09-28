#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import json

from app.backend.core.models.mdlpreview import ModelsWatcher

if __name__ == '__main__':
    modelsWatcher = ModelsWatcher()
    modelsWatcher.refreshModelsInfo()
    print (modelsWatcher)
    print ('-----')
    for ii,mm in enumerate(modelsWatcher.dictModelsInfo.values()):
        print ('[%d] : %s' % (ii, mm))
        for jj,ss in enumerate(mm.getTraindedSnapshots()):
            print ('\tsnapshot#%d : %s' % (jj, ss))
