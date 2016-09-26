#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

from app.backend.core import utils as dlsutils
from app.backend.core.models import CFG_SOLVER, CFG_MODEL, PREFIX_SNAPSHOT, EXT_MODEL_WEIGHTS

class ModelTaskInfo:
    pathModelTask=None
    def __init__(self, pathModelTask):
        self.pathModelTask = pathModelTask

if __name__ == '__main__':
    dirModels=dlsutils.getPathForModelsDir()
    print (dirModels)