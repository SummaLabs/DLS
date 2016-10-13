#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json
from app.backend.core.models.api import modelsWatcher

if __name__ == '__main__':
    print ('-------- [ Models Watcher ROCs API ] ---------')
    for modelId, modelInfo in modelsWatcher.dictModelsInfo.items():
        print ('*** ROC for model %s:' % modelInfo)
        dataROC = modelsWatcher.getModelROC(modelId)
        print (json.dumps(dataROC, indent=4))