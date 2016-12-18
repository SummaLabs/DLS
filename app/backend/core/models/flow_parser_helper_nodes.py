#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

from keras.layers import Layer, \
    Convolution1D, Convolution2D, Convolution3D, \
    MaxPooling1D, MaxPooling2D, MaxPooling3D, \
    AveragePooling1D, AveragePooling2D, AveragePooling3D, \
    InputLayer, Activation, Flatten, Merge, Dense

from flow_parser_helper_basic import dictAvailableConnectionsFromTo, dictRequiredFields

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
    def getConfig(self, inputShape=None):
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
    def getConfig(self, inputShape=None):
        #FIXME: setup input shape from Dataset Info
        if inputShape is None:
            tmpLayerCfg = InputLayer(input_shape=(3,256,256)).get_config()
        else:
            tmpLayerCfg = InputLayer(input_shape=inputShape).get_config()
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
    def getConfig(self, inputShape=None):
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
    def getConfig(self, inputShape=None):
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
    def getConfig(self, inputShape=None):
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
    def getConfig(self, inputShape=None):
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
    def getConfig(self, inputShape=None):
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
    def getConfig(self, inputShape=None):
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
    def getConfig(self, inputShape=None):
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
    def getConfig(self, inputShape=None):
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
    def getConfig(self, inputShape=None):
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
    def getConfig(self, inputShape=None):
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

if __name__ == '__main__':
    pass