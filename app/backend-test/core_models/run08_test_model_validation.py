#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import json
import glob
from app.backend.core.models.flow_parser import DLSDesignerFlowsParser

dirWithModels='../../../data-test/test-models-json/'

if __name__ == '__main__':
    lstModelsJson=glob.glob('%s/test_cnn*.json' % dirWithModels)
    numModels=len(lstModelsJson)
    if numModels<1:
        print ('Cant find json-configs in directory [%s]' % dirWithModels)
    for ii,pp in enumerate(lstModelsJson):
        tret = DLSDesignerFlowsParser.validateJsonFlowAsKerasModel(pp)
        print ('[%d/%d] : [%s] --> %s' % (ii,numModels, os.path.basename(pp), tret))
