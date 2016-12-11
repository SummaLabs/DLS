#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json

from app.backend.core.datasets.dbimageinfo import DatasetImage2dInfo

pathDB='/home/ar/gitlab.com/DLS.ai/DLS.git/data/datasets/dbset-20160916-105254-938547'

if __name__ == '__main__':
    dbImage2dInfo = DatasetImage2dInfo(pathDB)
    dbImage2dInfo.loadDBInfo()
    ret      = dbImage2dInfo.getInfoStat()
    retHists = dbImage2dInfo.getInfoStatWithHists()
    print ('Info:')
    print (json.dumps(ret, indent=4))
    print ('-------------')
    print ('Info+Hists:')
    print (json.dumps(retHists, indent=4))
