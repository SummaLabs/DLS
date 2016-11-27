#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import app.backend.core.utils as dlsutils
import json

import skimage.io as io
import matplotlib.pyplot as plt
from keras.utils.visualize_util import plot as kplot

####################################
# values: (is Available, is Correct but currently not available)
dictAvailableConnectionsFromTo = {
    'data' : {
        'data'          : (False, None),
        'convolution1d' : (True,  None),
        'convolution2d' : (True,  None),
        'convolution3d' : (True,  None),
        'pooling1d'     : (True,  None),
        'pooling2d'     : (True,  None),
        'pooling3d'     : (True,  None),
        'flatten'       : (True,  None),
        'activation'    : (True,  None),
        'merge'         : (True,  None),
        'dense'         : (True,  None),
        'solver'        : (False, None)
    },
    'convolution1d' : {
        'data'          : (False, None),
        'convolution1d' : (True,  None),
        'convolution2d' : (False,  None),
        'convolution3d' : (False,  None),
        'pooling1d'     : (True,  None),
        'pooling2d'     : (False,  None),
        'pooling3d'     : (False,  None),
        'flatten'       : (True,  None),
        'activation'    : (True,  None),
        'merge'         : (True,  None),
        'dense'         : (True,  None),
        'solver'        : (False, None)
    },
    'convolution2d': {
        'data'          : (False, None),
        'convolution1d' : (False, None),
        'convolution2d' : (True, None),
        'convolution3d' : (False, None),
        'pooling1d'     : (False, None),
        'pooling2d'     : (True, None),
        'pooling3d'     : (False, None),
        'flatten'       : (True, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'solver'        : (False, None)
    },
    'convolution3d': {
        'data'          : (False, None),
        'convolution1d' : (False, None),
        'convolution2d' : (False, None),
        'convolution3d' : (True, None),
        'pooling1d'     : (False, None),
        'pooling2d'     : (False, None),
        'pooling3d'     : (True, None),
        'flatten'       : (True, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'solver'        : (False, None)
    },
    'pooling1d': {
        'data'          : (False, None),
        'convolution1d' : (True, None),
        'convolution2d' : (False, None),
        'convolution3d' : (False, None),
        'pooling1d'     : (True, None),
        'pooling2d'     : (False, None),
        'pooling3d'     : (False, None),
        'flatten'       : (True, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'solver'        : (False, None)
    },
    'pooling2d': {
        'data'          : (False, None),
        'convolution1d' : (False, None),
        'convolution2d' : (True, None),
        'convolution3d' : (False, None),
        'pooling1d'     : (False, None),
        'pooling2d'     : (True, None),
        'pooling3d'     : (False, None),
        'flatten'       : (True, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'solver'        : (False, None)
    },
    'pooling3d': {
        'data'          : (False, None),
        'convolution1d' : (False, None),
        'convolution2d' : (False, None),
        'convolution3d' : (True, None),
        'pooling1d'     : (False, None),
        'pooling2d'     : (False, None),
        'pooling3d'     : (True, None),
        'flatten'       : (True, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'solver'        : (False, None)
    },
    'flatten': {
        'data'          : (False, None),
        'convolution1d' : (True, None),
        'convolution2d' : (False, None),
        'convolution3d' : (False, None),
        'pooling1d'     : (True, None),
        'pooling2d'     : (False, None),
        'pooling3d'     : (False, None),
        'flatten'       : (False, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'solver'        : (False, None)
    },
    'activation': {
        'data'          : (False, None),
        'convolution1d' : (True, None),
        'convolution2d' : (True, None),
        'convolution3d' : (True, None),
        'pooling1d'     : (True, None),
        'pooling2d'     : (True, None),
        'pooling3d'     : (True, None),
        'flatten'       : (True, None),
        'activation'    : (False, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'solver'        : (True, None)
    },
    'dense' : {
        'data'          : (False, None),
        'convolution1d' : (True, None),
        'convolution2d' : (False, None),
        'convolution3d' : (False, None),
        'pooling1d'     : (True, None),
        'pooling2d'     : (False, None),
        'pooling3d'     : (False, None),
        'flatten'       : (True, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True,  None),
        'solver'        : (True,  None)
    },
    'solver' : {
        'data'          : (False, None),
        'convolution1d' : (False, None),
        'convolution2d' : (False, None),
        'convolution3d' : (False, None),
        'pooling1d'     : (False, None),
        'pooling2d'     : (False, None),
        'pooling3d'     : (False, None),
        'flatten'       : (False, None),
        'activation'    : (False, None),
        'merge'         : (False, None),
        'dense'         : (False, None),
        'solver'        : (False, None)
    }
}

dictRequiredFields = {
    'data'          : ['datasetType', 'datasetId'],
    'convolution1d' : ['filtersCount', 'filterWidth', 'activationFunction', 'isTrainable'],
    'convolution2d' : ['filtersCount', 'filterWidth', 'filterHeight', 'activationFunction', 'isTrainable'],
    'convolution3d' : ['filtersCount', 'filterWidth', 'filterHeight', 'filterDepth', 'activationFunction', 'isTrainable'],
    'pooling1d'     : ['subsamplingSizeWidth', 'subsamplingType'],
    'pooling2d'     : ['subsamplingSizeWidth', 'subsamplingSizeHeight', 'subsamplingType'],
    'pooling3d'     : ['subsamplingSizeWidth', 'subsamplingSizeHeight', 'subsamplingSizeDepth', 'subsamplingType'],
    'flatten'       : [],
    'activation'    : ['activationFunction'],
    'merge'         : ['mergeType', 'mergeAxis'],
    'dense'         : ['neuronsCount', 'activationFunction', 'isTrainable'],
    'solver'        : ['epochsCount', 'snapshotInterval', 'validationInterval', 'batchSize', 'learningRate', 'optimizer']
}

####################################
class NodeF:
    inpNode = None
    outNode = None
    jsonCfg = None
    def __init__(self, jsonNode, inpNode=None, outNode=None):
        self.jsonCfg    = jsonNode
        self.jsonParams = jsonNode['params']
        self.inpNode    = inpNode
        self.outNode    = outNode
    def toString(self):
        strInp = 'NULL'
        if self.inpNode is not None:
            strInp = '%s(%s)' % (self.inpNode[0].jsonCfg['id'],self.inpNode[0].jsonCfg['layerType'])
        strOut = 'NULL'
        if self.outNode is not None:
            strOut = '%s(%s)' % (self.outNode[0].jsonCfg['id'], self.outNode[0].jsonCfg['layerType'])
        strCfg = 'NULL'
        if self.jsonCfg is not None:
            strCfg = '%s(%s)' % (self.jsonCfg['id'], self.jsonCfg['layerType'])
        ret = '{obj->[%s],  in:%s, out:%s}' % (strCfg, strInp, strOut)
        return ret
    def validateFields(self):
        if self.jsonCfg is not None:
            strType = self.jsonCfg['layerType']
            if not strType in dictRequiredFields.keys():
                raise Exception('Unknown node type [%s]' % strType)
            tmpParamNames=self.jsonParams.keys()
            for ii in dictRequiredFields[strType]:
                if not ii in tmpParamNames:
                    raise Exception('Required field in Node not found: nodeFieled=[%s], NodeType=[%s], NodeId=[%s]' % (ii, strType, self.jsonCfg['id']))
    def __str__(self):
        return self.toString()
    def __repr__(self):
        return self.toString()

####################################
def checkPreviousConnection(pNode):
    pNodeType = pNode.jsonCfg['layerType']
    if pNode.inpNode is not None:
        inpNodeType = pNode.inpNode[0].jsonCfg['layerType']
        if (pNodeType in dictAvailableConnectionsFromTo.keys()) and (inpNodeType in dictAvailableConnectionsFromTo.keys()):
            return dictAvailableConnectionsFromTo[pNodeType][inpNodeType]
        else:
            raise NotImplementedError('Incorrect or unsupproted connection (%s -> %s)' % (inpNodeType, pNodeType))
    return True



pathTestModel='../../../data-test/test-models-json/test_basic_cnn_network_v1_with_train_params_v1.json'


if __name__ == '__main__':
    pass