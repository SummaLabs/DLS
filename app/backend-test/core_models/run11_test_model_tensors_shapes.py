#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

from pprint import pprint

from app.backend.core.models.flow_parser import DLSDesignerFlowsParser

if __name__ == '__main__':
    pathModelJson = '../../../data-test/test-models-json/test_cnn1.json'
    modelJsonWithShapes = DLSDesignerFlowsParser.calculateShapesForModel(pathModelJson)
    pprint(modelJsonWithShapes)
