#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json

from app.backend.core.datasets.dbpreview import DatasetsWatcher
from app.backend.core.models.mdlpreview import ModelTaskDirBuilder

pathWithDatasets='../../../data/datasets'
pathTestModel='../../../data-test/test-models-json/test_cnn1.json'

if __name__ == '__main__':
    dbWatcher = DatasetsWatcher(pathWithDatasets)
    dbWatcher.refreshDatasetsInfo()
    for ii,kk in enumerate(dbWatcher.dictDbInfo.keys()):
        dbInfo = dbWatcher.dictDbInfo[kk]
        print ('[%d/%d] generate model-train task directory: %s' % (ii, len(dbWatcher.dictDbInfo.keys()), dbInfo.dbId))
        #
        with open(pathTestModel, 'r') as f:
            cfgJson = json.load(f)
            for ll in cfgJson['layers']:
                if ll['content']=='data':
                    ll['params']['datasetId'] = dbInfo.dbId
            ModelTaskDirBuilder.buildModelTrainTaskDir(cfgJson)
