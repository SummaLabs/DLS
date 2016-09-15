#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

from app.backend.core.datasets.dbpreview import DatasetImage2dInfo

pathDB='/home/ar/gitlab.com/DLS.ai/DLS.git/data/datasets/dbset-20160915-123416-688524'

if __name__ == '__main__':
    dbImage2dInfo = DatasetImage2dInfo(pathDB)
    dbImage2dInfo.loadDBInfo()
    print ('------')
