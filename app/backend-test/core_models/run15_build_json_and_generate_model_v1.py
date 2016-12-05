#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json

from compiler.ast import flatten

import warnings as warn

import skimage.io as skio
import matplotlib.pyplot as plt
from keras.utils.visualize_util import plot as kplot

import toposort

import keras
from keras.layers import Layer, \
    Convolution1D, Convolution2D, Convolution3D, \
    MaxPooling1D, MaxPooling2D, MaxPooling3D, \
    AveragePooling1D, AveragePooling2D, AveragePooling3D, \
    InputLayer, Activation, Flatten, Merge, Dense

####################################
# values: (is Available, is Correct but currently not available)
dictAvailableConnectionsFromTo = {
    'datainput' : {
        'datainput'     : (False, None),
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
        'dataoutput'    : (False, None)
    },
    'convolution1d' : {
        'datainput'     : (False, None),
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
        'dataoutput'    : (False, None)
    },
    'convolution2d': {
        'datainput'     : (False, None),
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
        'dataoutput'    : (False, None)
    },
    'convolution3d': {
        'datainput'     : (False, None),
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
        'dataoutput'    : (False, None)
    },
    'pooling1d': {
        'datainput'     : (False, None),
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
        'dataoutput'    : (False, None)
    },
    'pooling2d': {
        'datainput'     : (False, None),
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
        'dataoutput'    : (False, None)
    },
    'pooling3d': {
        'datainput'     : (False, None),
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
        'dataoutput'    : (False, None)
    },
    'flatten': {
        'datainput'     : (False, None),
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
        'dataoutput'    : (False, None)
    },
    'activation': {
        'datainput'     : (False, None),
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
        'dataoutput'    : (True, None)
    },
    'merge': {
        'datainput'     : (False, None),
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
        'dataoutput'    : (True, None)
    },
    'dense' : {
        'datainput'     : (False, None),
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
        'dataoutput'    : (True,  None)
    },
    'dataoutput' : {
        'datainput'     : (False, None),
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
        'dataoutput'    : (False, None)
    }
}

dictRequiredFields = {
    'datainput'     : ['datasetType', 'datasetId'],
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
    'dataoutput'    : ['lossFunction', 'datasetId']
}

####################################
class NodeFBuilder:
    # Counter dict
    nodeTypeCounter = None
    def __init__(self):
        self.nodeTypeCounter = { kk: 0 for kk in dictAvailableConnectionsFromTo.keys() }
    def toString(self):
        return self.nodeTypeCounter
    def __str__(self):
        return self.toString()
    def __repr__(self):
        return self.toString()
    def newNodeF(self, jsonNode):
        strType = jsonNode['layerType']
        if strType not in self.nodeTypeCounter.keys():
            raise Exception('Unknown node type [%s]' % strType)
        self.nodeTypeCounter[strType]+=1
        strNodeName = '%s_%d' % (strType, self.nodeTypeCounter[strType])
        if strType=='datainput':
            return NodeDataInput(jsonNode, goodName=strNodeName)
        elif strType=='convolution1d':
            return NodeConvolution1D(jsonNode, goodName=strNodeName)
        elif strType == 'convolution2d':
            return NodeConvolution2D(jsonNode, goodName=strNodeName)
        elif strType == 'convolution3d':
            return NodeConvolution3D(jsonNode, goodName=strNodeName)
        elif strType == 'pooling1d':
            return NodePooling1D(jsonNode, goodName=strNodeName)
        elif strType == 'pooling2d':
            return NodePooling2D(jsonNode, goodName=strNodeName)
        elif strType == 'pooling3d':
            return NodePooling3D(jsonNode, goodName=strNodeName)
        elif strType == 'flatten':
            return NodeFlatten(jsonNode, goodName=strNodeName)
        elif strType == 'activation':
            return NodeActivation(jsonNode, goodName=strNodeName)
        elif strType == 'merge':
            return NodeMerge(jsonNode, goodName=strNodeName)
        elif strType == 'dense':
            return NodeDense(jsonNode, goodName=strNodeName)
        else:
            return NodeF(jsonNode, goodName=strNodeName)

####################################
class NodeF:
    nodeClass = 'Layer'
    goodName = None
    inpNode = None
    outNode = None
    jsonCfg = None
    def __init__(self, jsonNode, inpNode=None, outNode=None, goodName=None):
        self.goodName   = goodName
        self.jsonCfg    = jsonNode
        self.jsonParams = jsonNode['params']
        self.inpNode    = inpNode
        self.outNode    = outNode
    def getName(self):
        if self.jsonCfg is not None:
            if self.goodName is None:
                return self.jsonCfg['layerType']
            else:
                return self.goodName
        else:
            return 'Unknown-Type'
    def type(self):
        return self.jsonCfg['layerType']
    def toString(self):
        strInp = 'NULL'
        if self.inpNode is not None:
            strInp = '%s(%s)' % (self.inpNode[0].jsonCfg['id'],self.inpNode[0].getName())
        strOut = 'NULL'
        if self.outNode is not None:
            strOut = '%s(%s)' % (self.outNode[0].jsonCfg['id'], self.outNode[0].getName())
        strCfg = 'NULL'
        if self.jsonCfg is not None:
            strCfg = '%s(%s)' % (self.jsonCfg['id'], self.getName())
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
    def getConfig(self):
        tmpLayerCfg = Layer().get_config()
        tmpLayerCfg['name'] = self.getName()
        return {
            'class_name': 'Layer',
            'name': self.getName(),
            'config': tmpLayerCfg
        }
    def getInboundNodesCfg(self):
        ret = []
        if self.inpNode is not None:
            for nn in self.inpNode:
                ret.append([
                    nn.getName(),
                    0,
                    0
                ])
        return ret

####################################
class NodeDataInput(NodeF):
    nodeClass = 'InputLayer'
    def __init__(self, jsonNode, inpNode=None, outNode=None, goodName=None):
        NodeF.__init__(self, jsonNode, inpNode=inpNode, outNode=outNode, goodName=goodName)
    def getConfig(self):
        #FIXME: setup input shape from Dataset Info
        tmpLayerCfg = InputLayer(input_shape=(3,256,256)).get_config()
        tmpLayerCfg['name'] = self.getName()
        tmp = {
            'class_name': self.nodeClass,
            'name': self.getName(),
            'config': tmpLayerCfg,
            'inbound_nodes': self.getInboundNodesCfg()
        }
        return tmp

class NodeConvolution1D(NodeF):
    nodeClass = 'Convolution1D'
    def __init__(self, jsonNode, inpNode=None, outNode=None, goodName=None):
        NodeF.__init__(self, jsonNode, inpNode=inpNode, outNode=outNode, goodName=goodName)
    def getConfig(self):
        tmpCfg = self.jsonCfg['params']
        tmpLayerCfg = Convolution1D(nb_filter=tmpCfg['filtersCount'],
                                    filter_length=tmpCfg['filterWidth'],
                                    activation=tmpCfg['activationFunction'],
                                    trainable=tmpCfg['isTrainable']).get_config()
        tmpLayerCfg['name'] = self.getName()
        tmp = {
            'class_name': self.nodeClass,
            'name': self.getName(),
            'config': tmpLayerCfg,
            'inbound_nodes': self.getInboundNodesCfg()
        }
        return tmp

class NodeConvolution2D(NodeF):
    nodeClass = 'Convolution2D'
    def __init__(self, jsonNode, inpNode=None, outNode=None, goodName=None):
        NodeF.__init__(self, jsonNode, inpNode=inpNode, outNode=outNode, goodName=goodName)
    def getConfig(self):
        tmpCfg = self.jsonCfg['params']
        tmpLayerCfg = Convolution2D(nb_filter=tmpCfg['filtersCount'],
                                    nb_col=tmpCfg['filterWidth'],
                                    nb_row=tmpCfg['filterHeight'],
                                    activation=tmpCfg['activationFunction'],
                                    trainable=tmpCfg['isTrainable']).get_config()
        tmpLayerCfg['name'] = self.getName()
        tmp = {
            'class_name': self.nodeClass,
            'name': self.getName(),
            'config': tmpLayerCfg,
            'inbound_nodes': self.getInboundNodesCfg()
        }
        return tmp

class NodeConvolution3D(NodeF):
    nodeClass = 'Convolution3D'
    def __init__(self, jsonNode, inpNode=None, outNode=None, goodName=None):
        NodeF.__init__(self, jsonNode, inpNode=inpNode, outNode=outNode, goodName=goodName)
    def getConfig(self):
        tmpCfg = self.jsonCfg['params']
        tmpLayerCfg = Convolution3D(nb_filter=tmpCfg['filtersCount'],
                                    kernel_dim1=tmpCfg['filterWidth'],
                                    kernel_dim2=tmpCfg['filterHeight'],
                                    kernel_dim3=tmpCfg['filterDepth'],
                                    activation=tmpCfg['activationFunction'],
                                    trainable=tmpCfg['isTrainable']).get_config()
        tmpLayerCfg['name'] = self.getName()
        tmp = {
            'class_name': self.nodeClass,
            'name': self.getName(),
            'config': tmpLayerCfg,
            'inbound_nodes': self.getInboundNodesCfg()
        }
        return tmp

class NodePooling1D(NodeF):
    nodeClass = 'MaxPooling1D'
    def __init__(self, jsonNode, inpNode=None, outNode=None, goodName=None):
        NodeF.__init__(self, jsonNode, inpNode=inpNode, outNode=outNode, goodName=goodName)
        if self.jsonCfg['subsamplingType'] == 'max_pooling':
            self.nodeClass = 'MaxPooling1D'
        else:
            self.nodeClass = 'AveragePooling1D'
    def getConfig(self):
        tmpCfg = self.jsonCfg['params']
        if self.nodeClass=='MaxPooling1D':
            tmpLayerCfg = MaxPooling1D(pool_length=tmpCfg['subsamplingSizeWidth']).get_config()
        else:
            tmpLayerCfg = AveragePooling1D(pool_length=tmpCfg['subsamplingSizeWidth']).get_config()
        tmpLayerCfg['name'] = self.getName()
        tmp = {
            'class_name': self.nodeClass,
            'name': self.getName(),
            'config': tmpLayerCfg,
            'inbound_nodes': self.getInboundNodesCfg()
        }
        return tmp

class NodePooling2D(NodeF):
    nodeClass = 'MaxPooling2D'
    def __init__(self, jsonNode, inpNode=None, outNode=None, goodName=None):
        NodeF.__init__(self, jsonNode, inpNode=inpNode, outNode=outNode, goodName=goodName)
        if self.jsonParams['subsamplingType'] == 'max_pooling':
            self.nodeClass = 'MaxPooling2D'
        else:
            self.nodeClass = 'AveragePooling2D'
    def getConfig(self):
        tmpCfg = self.jsonCfg['params']
        if self.nodeClass == 'MaxPooling2D':
            tmpLayerCfg = MaxPooling2D(
                pool_size=(tmpCfg['subsamplingSizeWidth'], tmpCfg['subsamplingSizeHeight'])).get_config()
        else:
            tmpLayerCfg = AveragePooling2D(
                pool_size=(tmpCfg['subsamplingSizeWidth'], tmpCfg['subsamplingSizeHeight'])).get_config()
        tmpLayerCfg['name'] = self.getName()
        tmp = {
            'class_name': self.nodeClass,
            'name': self.getName(),
            'config': tmpLayerCfg,
            'inbound_nodes': self.getInboundNodesCfg()
        }
        return tmp

class NodePooling3D(NodeF):
    nodeClass = 'MaxPooling3D'
    def __init__(self, jsonNode, inpNode=None, outNode=None, goodName=None):
        NodeF.__init__(self, jsonNode, inpNode=inpNode, outNode=outNode, goodName=goodName)
        if self.jsonCfg['subsamplingType'] == 'max_pooling':
            self.nodeClass = 'MaxPooling3D'
        else:
            self.nodeClass = 'AveragePooling3D'
    def getConfig(self):
        tmpCfg = self.jsonCfg['params']
        if self.nodeClass == 'MaxPooling3D':
            tmpLayerCfg = MaxPooling3D(
                pool_size=(tmpCfg['subsamplingSizeWidth'],
                           tmpCfg['subsamplingSizeHeight'],
                           tmpCfg['subsamplingSizeDepth'])).get_config()
        else:
            tmpLayerCfg = AveragePooling3D(
                pool_size=(tmpCfg['subsamplingSizeWidth'],
                           tmpCfg['subsamplingSizeHeight'],
                           tmpCfg['subsamplingSizeDepth'])).get_config()
        tmpLayerCfg['name'] = self.getName()
        tmp = {
            'class_name': self.nodeClass,
            'name': self.getName(),
            'config': tmpLayerCfg,
            'inbound_nodes': self.getInboundNodesCfg()
        }
        return tmp

class NodeActivation(NodeF):
    nodeClass = 'Activation'
    def __init__(self, jsonNode, inpNode=None, outNode=None, goodName=None):
        NodeF.__init__(self, jsonNode, inpNode=inpNode, outNode=outNode, goodName=goodName)
    def getConfig(self):
        tmpCfg = self.jsonCfg['params']
        tmpLayerCfg = Activation(activation=tmpCfg['activationFunction']).get_config()
        tmpLayerCfg['name'] = self.getName()
        tmp = {
            'class_name': self.nodeClass,
            'name': self.getName(),
            'config': tmpLayerCfg,
            'inbound_nodes': self.getInboundNodesCfg()
        }
        return tmp

class NodeFlatten(NodeF):
    nodeClass = 'Flatten'
    def __init__(self, jsonNode, inpNode=None, outNode=None, goodName=None):
        NodeF.__init__(self, jsonNode, inpNode=inpNode, outNode=outNode, goodName=goodName)
    def getConfig(self):
        tmpLayerCfg = Flatten().get_config()
        tmpLayerCfg['name'] = self.getName()
        tmp = {
            'class_name': self.nodeClass,
            'name': self.getName(),
            'config': tmpLayerCfg,
            'inbound_nodes': self.getInboundNodesCfg()
        }
        return tmp

class NodeMerge(NodeF):
    nodeClass = 'Merge'
    def __init__(self, jsonNode, inpNode=None, outNode=None, goodName=None):
        NodeF.__init__(self, jsonNode, inpNode=inpNode, outNode=outNode, goodName=goodName)
    def getConfig(self):
        tmpCfg = self.jsonCfg['params']
        tmpLayerCfg = Merge(mode=tmpCfg['mergeType'],
                            concat_axis=int(tmpCfg['mergeAxis'])).get_config()
        tmpLayerCfg['name'] = self.getName()
        tmp = {
            'class_name': self.nodeClass,
            'name': self.getName(),
            'config': tmpLayerCfg,
            'inbound_nodes': self.getInboundNodesCfg()
        }
        return tmp

class NodeDense(NodeF):
    nodeClass = 'Dense'
    def __init__(self, jsonNode, inpNode=None, outNode=None, goodName=None):
        NodeF.__init__(self, jsonNode, inpNode=inpNode, outNode=outNode, goodName=goodName)
    def getConfig(self):
        tmpCfg = self.jsonCfg['params']
        tmpLayerCfg = Dense(output_dim=tmpCfg['neuronsCount'],
                            activation=tmpCfg['activationFunction'],
                            trainable=tmpCfg['isTrainable']).get_config()
        tmpLayerCfg['name'] = self.getName()
        tmp = {
            'class_name': self.nodeClass,
            'name': self.getName(),
            'config': tmpLayerCfg,
            'inbound_nodes': self.getInboundNodesCfg()
        }
        return tmp

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

####################################
class DLSDesignerFlowsParserV2:
    configFlowRaw    = None
    configFlow       = None
    configFlowLinked = None
    configFlowLinkedSorted = None
    supportedNodes   = dictRequiredFields.keys()
    reqiredNodes     = ['datainput', 'dataoutput']
    def __init__(self, jsonFlow):
        if isinstance(jsonFlow, basestring):
            with open(jsonFlow, 'r') as f:
                self.configFlowRaw = json.load(f)
        elif isinstance(jsonFlow, dict):
            self.configFlowRaw = jsonFlow
        else:
            raise Exception('Unknown type for Model flow [%s]' % type(jsonFlow))
    def clear(self):
        self.configFlow       = None
        self.configFlowRaw    = None
        self.configFlowLinked = None
    def isOk(self):
        return (self.configFlowRaw is not None)
    def checkIsOk(self):
        if not self.isOk():
            raise Exception('class FlowsParsser is not properly configured')
    def countNodeType(self, cfg, strType):
        cnt = 0
        for ii in cfg:
            if ii['type'] == strType:
                cnt+=1
    def findNodeById(self, cfg, strId):
        #FIXME: we requre, than each element have unique ID
        for ii in cfg:
            if ii['id'] == strId:
                return ii
    def removeNodeFromWires(self, cfg, elem):
        tmpId=elem['id']
        for ii in cfg:
            if 'wires' in ii.keys():
                if tmpId in ii['wires']:
                    ii['wires'].remove(tmpId)
    def checkNumberOfWires(self, cfg):
        for ii in cfg:
            if 'wires' in ii.keys():
                # numWires = max([0]+[len(x) for x in ii['wires']])
                numWires = max([0] + [len(ii['wires'])])
                if numWires>1:
                    raise NotImplementedError('Converter currently not supported multiple connections [%s]' % ii)
    #FIXME: this code very inefficinet, but as ia think more understandable...
    def findLinkedNodes(self, lstNodes, pNode):
        # (1) find output-connections
        if 'wires' in pNode.jsonCfg.keys():
            tlstId = flatten(pNode.jsonCfg['wires'])
            if len(tlstId)>0:
                for ii in lstNodes:
                    #FIXME: check this code for many connections
                    if ii.jsonCfg['id'] in tlstId:
                        if pNode.outNode is None:
                            pNode.outNode = []
                        pNode.outNode.append(ii)
        # (2) find input-connections
        pNodeId=pNode.jsonCfg['id']
        for ii in lstNodes:
            if 'wires' in ii.jsonCfg.keys():
                tlstId = flatten(ii.jsonCfg['wires'])
                if pNodeId in tlstId:
                    if pNode.inpNode is None:
                        pNode.inpNode = []
                    pNode.inpNode.append(ii)

    def getConnectedList(self, cfg, isCheckConnections=True):
        # (1) generate non-linked list of Nodes
        lstNodes=[]
        nodeBuilder = NodeFBuilder()
        for ii in cfg:
            tmpNode = nodeBuilder.newNodeF(ii) #NodeF(ii)
            lstNodes.append(tmpNode)
        # (2) link nodes
        for ii in lstNodes:
            self.findLinkedNodes(lstNodes, ii)
        # (3) find input nodes: in sequential model there is only one Input Node
        tmpInputNodes=[]
        for ii in lstNodes:
            if ii.inpNode is None:
                tmpInputNodes.append(ii)
        if len(tmpInputNodes)>1:
            warn.warn('Flow have more than one input nodes (currently not implemented) or not linked [%s]' % tmpInputNodes, FutureWarning)
            # raise NotImplementedError('Flow have more than one input nodes (currently not implemented) or not linked [%s]' % tmpInputNodes)
        if len(tmpInputNodes)<1:
            raise Exception('Unknown graph connection')
        #FIXME: for backward-compatibility
        lstFlowNodes = lstNodes
        # Old-code:
        # lstFlowNodes = []
        # firstNode = tmpInputNodes[0]
        # lstFlowNodes.append(firstNode)
        # maxCnt=5000
        # cnt=0
        # tmpNode = firstNode
        # while cnt<maxCnt:
        #     if tmpNode.outNode is not None:
        #         tmpNode = tmpNode.outNode[0] #FIXME: work only for sequential models
        #         lstFlowNodes.append(tmpNode)
        #     else:
        #         break
        #     cnt+=1
        if isCheckConnections:
            # (1) Validate node-fields
            for nn in lstFlowNodes:
                nn.validateFields()
            # (2) Validate between-nodes connections
            for idx,nn in enumerate(lstFlowNodes):
                if not checkPreviousConnection(nn):
                    raise Exception('Inkorrect node connection %d : [%s] -> [%s]' % (idx, nn.inpNode[0], nn))
            # (3) Check required nodes:
            lstNodeType = [ii.jsonCfg['layerType'] for ii in lstFlowNodes]
            for ii in self.reqiredNodes:
                if not ii in lstNodeType:
                    raise Exception('In Neural Flow missing required node [%s]' % ii)
        return lstFlowNodes
    def getConnectedFlow(self, isCheckConnections=True):
        return self.getConnectedList(self.configFlow, isCheckConnections)
    def buildConnectedFlow(self, isCheckConnections=True):
        self.configFlowLinked = self.getConnectedFlow(isCheckConnections=isCheckConnections)
    def cleanAndValidate(self):
        self.checkIsOk()
        # numTabs = self.countNodeType(self.configFlowRaw, 'tab')
        # if numTabs>1:
        #     raise NotImplementedError('Currently FlowsParser support only one <tab> in config')
        self.configFlow = []
        tmpNodesForRemoving=[]
        tmpCfg      = list(self.configFlowRaw['layers'])
        tmpIdRemove = []
        # (0) raise exception when in flow non-supported node types is presents
        extSupportedNodes = ['tab'] + self.supportedNodes
        for ii in tmpCfg:
            if 'layerType' not in ii.keys():
                raise Exception('Incorrect node config: <layerType> is absent! [%s]' % ii)
            if ii['layerType'] not in extSupportedNodes:
                raise Exception('Non-supported node type [%s], id=[%s]' % (ii['layerType'], ii['id']))
        # (1) find nodes for remove from graph
        for ii in tmpCfg:
            if ii['layerType'] not in self.supportedNodes:
                tmpNodesForRemoving.append(ii)
        # (2) remove id from wires
        for ii in tmpNodesForRemoving:
            self.removeNodeFromWires(tmpCfg, ii)
        # (3) remove nodes from graph
        for ii in tmpNodesForRemoving:
            tmpCfg.remove(ii)
        # (4) check #wires
        # self.checkNumberOfWires(tmpCfg)
        self.configFlow = tmpCfg
    def exportConfig2Json(self, cfg, fout):
        with open(fout, 'w') as f:
            f.write(json.dumps(cfg, indent=4))
    def exportConfigFlow(self, fout):
        self.checkIsOk()
        self.exportConfig2Json(self.configFlow, fout=fout)
    def generateModelKerasConfigJson(self, modelName='model_1'):
        self.checkIsOk()
        if self.configFlowLinked is None:
            raise Exception('Node-linked Flow is not prepared, please call ::buildConnectedFlow() before!')
        # (0) Prepare topological sorted model flow
        tmpIdxDict = {}
        for ii,ll in enumerate(self.configFlowLinked):
            tmpIdxDict[ll] = ii
        tmpTopoDict = {}
        for ii, ll in enumerate(self.configFlowLinked):
            tmpIdxSet = set({})
            if ll.outNode is not None:
                for kk in ll.outNode:
                    tmpIdxSet.add(tmpIdxDict[kk])
            tmpTopoDict[ii] = tmpIdxSet
        # sortedFlowIdx  = list(toposort.toposort(tmpTopoDict))[::-1]
        sortedFlowIdx = list(toposort.toposort_flatten(tmpTopoDict))[::-1]
        self.configFlowLinkedSorted = [self.configFlowLinked[idx] for idx in sortedFlowIdx]
        #FIXME: this is a temporary solution
        tmpExcludeNodes={'dataoutput'}
        # (1) Basic model json-template
        modelTemplate = {
            "class_name":   "Model",
            "keras_version": keras.__version__,
            "config": {
                "name": "%s" % modelName,
                "layers" : [],
                "input_layers": [],
                "output_layers": [],
            }
        }
        # (2) Generate layers configs
        tmpLayersCfg = []
        for ii,nn in enumerate(self.configFlowLinkedSorted):
            if nn.type() in tmpExcludeNodes:
                continue
            tmpCfg = nn.getConfig()
            inboundNodes = []
            if nn.inpNode is not None:
                for kk in nn.inpNode:
                    if kk.type() not in tmpExcludeNodes:
                        inboundNodes.append([
                            kk.getName(),
                            0,
                            0
                        ])
            if len(inboundNodes)>0:
                tmpCfg['inbound_nodes'] = [inboundNodes]
            else:
                tmpCfg['inbound_nodes'] = []
            tmpLayersCfg.append(tmpCfg)
        modelTemplate['config']['layers'] = tmpLayersCfg
        # (3) Generate input model info
        tmpInputLayers = []
        for ii, nn in enumerate(self.configFlowLinkedSorted):
            if isinstance(nn, NodeDataInput):
                tmpInputLayers.append([
                    nn.getName(),
                    0,
                    0
                ])
        # (4) Generate output model info
        tmpOutputLayers = []
        for ii, nn in enumerate(self.configFlowLinkedSorted):
            if nn.type() == 'dataoutput':
                tmpOutputLayers.append([
                    nn.inpNode[0].getName(),
                    0,
                    0
                ])
        modelTemplate['config']['input_layers'] = tmpInputLayers
        modelTemplate['config']['output_layers'] = tmpOutputLayers
        return modelTemplate

####################################
class Test:
    tmpDict={}
    tstr = ''
    def __init__(self, parStr):
        self.tstr = parStr
    def toString(self):
        return 'Test(%s)' % self.tstr
    def __str__(self):
        return self.toString()
    def __repr__(self):
        return self.toString()
    @staticmethod
    def printTest():
        print (Test.tmpDict)
    @staticmethod
    def newTest(parStr):
        ret = Test(parStr=parStr)
        if parStr in Test.tmpDict.keys():
            Test.tmpDict[parStr] += 1
        else:
            Test.tmpDict[parStr]  = 1
        return ret

def test_Test():
    t1 = Test.newTest('new1')
    t2 = Test.newTest('new2')
    t3 = Test.newTest('new1')
    t4 = Test.newTest('new1')
    print (t1)
    print (t2)
    print (t3)
    print (t4)
    Test.printTest()


####################################
if __name__ == '__main__':
    foutJson = 'keras-model-generated.json'
    fnFlowJson = '../../../data-test/test-models-json/testnet_multi_input_multi_output_v1.json'
    flowParser = DLSDesignerFlowsParserV2(fnFlowJson)
    flowParser.cleanAndValidate()
    # (1) Build connected and validated Model Node-flow (DLS-model-representation)
    flowParser.buildConnectedFlow()
    # (2) Generate dict-based Json Kearas model (from DLS model representation)
    modelJson = flowParser.generateModelKerasConfigJson()
    # (3) Export generated json model to file
    with open(foutJson, 'w') as f:
        f.write(json.dumps(modelJson, indent=4))
    # (4) Try to load generated Keras model from json-file
    with open(foutJson, 'r') as f:
        model = keras.models.model_from_json(f.read())
    # (5) Visualize & summary of the model: check connections!
    fimgModel = '%s-figure.jpg' % foutJson
    kplot(model, fimgModel, show_shapes=True)
    plt.imshow(skio.imread(fimgModel))
    plt.grid(True)
    plt.show()
    model.summary()
