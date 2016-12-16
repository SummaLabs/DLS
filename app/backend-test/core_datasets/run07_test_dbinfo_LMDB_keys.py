#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json

import lmdb

from app.backend.core.datasets.dbwatcher import DatasetsWatcher
from app.backend.core.datasets.dbimageinfo import DatasetImage2dInfo


pathWithDatasets='../../../data/datasets'

if __name__ == '__main__':
    dbWatcher = DatasetsWatcher(pathWithDatasets)
    dbWatcher.refreshDatasetsInfo()
    print ('\n\n\n--------------')
    print (dbWatcher)
    tpath0=dbWatcher.dictDbInfo[dbWatcher.dictDbInfo.keys()[0]].pathDB
    tdbInfo=DatasetImage2dInfo(tpath0)
    tdbInfo.loadDBInfo()
    with lmdb.open(tdbInfo.pathDbTrain) as env:
        with env.begin(write=False) as  txn:
            lstKeys = [key for key, _ in txn.cursor()]
            lstLblKeys = [int(xx) for xx in lstKeys]

            print (len(lstKeys))
            pass
    print (tdbInfo)
