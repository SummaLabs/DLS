#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

from pprint import pprint

from app.backend.core.models.flow_parser import DLSDesignerFlowsParser

if __name__ == '__main__':
    pathModelJson = '../../../data-test/test-models-json/test_cnn1.json'
    flowParser = DLSDesignerFlowsParser(pathModelJson)
    flowParser.cleanAndValidate()
    print ('Model-flow isOk: [%s]' % flowParser.isOk())
    kerasTrainer, cfgSolver, layersDict = flowParser.buildKerasTrainer(isPrecalculateLayersDict=True)
    modelJsonWithShapes=flowParser.configFlowRaw
    tmp = modelJsonWithShapes['layers']
    for ii in tmp:
        tid = ii['id']
        tshapeInp = 'Unknown'
        tshapeOut = 'Unknown'
        if tid in layersDict.keys():
            tlayer = layersDict[tid]
            tshapeInp = tlayer.input_shape
            tshapeOut = tlayer.output_shape
        ii['shape'] = {
            'inp':  tshapeInp,
            'out':  tshapeOut
        }
    modelJsonWithShapes['layers'] = tmp
    pprint(modelJsonWithShapes)
