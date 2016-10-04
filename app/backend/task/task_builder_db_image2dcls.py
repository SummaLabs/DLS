#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

from app.backend.core.datasets.dbbuilder import DBImage2DBuilder, DBImage2DConfig
from default_task import BaseTask
import time
import random

class TaskDBImage2DBuilder(BaseTask, DBImage2DBuilder):
    def __init__(self, pathCfgInp=None, pathDirOut=None):
        BaseTask.__init__(self)
        DBImage2DBuilder.__init__(self,pathCfgInp, pathDirOut)
    def perform(self):
        while self.alive:
            time.sleep(2)
            self.progress += 10
            self.rows.append({'c': [{'v': self.progress}, {'v': random.random()}, {'v': random.random()}]})
            if self.progress>=100:
                self.state='finished'
                self.alive=False

if __name__ == '__main__':
    pass