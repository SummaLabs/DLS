#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import json

from app.backend.core.datasets.dbwatcher import DatasetsWatcher

pathWithDatasets='../../../data/datasets'

if __name__ == '__main__':
    dbWatcher = DatasetsWatcher(pathWithDatasets)
    dbWatcher.refreshDatasetsInfo()
    print (json.dumps(dbWatcher.getDatasetsInfoStatList(), indent=4) )
    print ('----')
    print (dbWatcher)

