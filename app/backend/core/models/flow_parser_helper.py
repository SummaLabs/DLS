#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json
import keras
from keras.layers import Convolution1D, Convolution2D, Convolution3D
from keras.layers import MaxPooling1D, MaxPooling2D, MaxPooling3D,\
    AveragePooling1D, AveragePooling2D, AveragePooling3D
from keras.layers import UpSampling1D, UpSampling2D, UpSampling3D
from keras.layers import InputLayer, Activation, Flatten, Dense, Dropout

####################################
dictNonlinFunJson2Keras = {
    "SoftPlus"      : "softplus",
    "SoftSign"      : "softsign",
    "ReLU"          : "relu",
    "Tanh"          : "tanh",
    "Sigmoid"       : "sigmoid",
    "Hard Sigmoid"  : "hard_sigmoid",
    "Linear"        : "linear"
}

def nonlinFunJson2Keras(strJson):
    # if strJson in dictNonlinFunJson2Keras.keys():
    #     return dictNonlinFunJson2Keras[strJson]
    # return 'relu'
    #FIXME: currently we belive, that str-name of fucntion is a Keras-available name (see: https://keras.io/activations/)
    return strJson

####################################
def buildLayerConvolution1D(cfgNode):
    tcfg=cfgNode.jsonParams
    # assert (cfgNode.jsonCfg['layerType']=='convolution1d')
    numberFilters = int(tcfg['filtersCount']) if tcfg['filtersCount'] else 1
    filterSizeX = int(tcfg['filterWidth'])  if tcfg['filterWidth'] else 1
    strNonLinFunc = tcfg['activationFunction']
    isTrainable = tcfg['isTrainable'] if tcfg['isTrainable'] else True
    paramStride = (1, 1)
    strBorderMode = 'same'
    tmpLayer = Convolution1D(numberFilters, filterSizeX,
                             subsample=paramStride,
                             border_mode=strBorderMode,
                             activation=nonlinFunJson2Keras(strNonLinFunc))
    tmpLayer.trainable = isTrainable
    return tmpLayer

def buildLayerConvolution2D(cfgNode):
    tcfg=cfgNode.jsonParams
    # assert (cfgNode.jsonCfg['layerType']=='convolution2d')
    numberFilters = int(tcfg['filtersCount']) if tcfg['filtersCount'] else 1
    # FIXME: add stride to layer config in Builder
    paramStride = (1, 1)
    filterSizeX = int(tcfg['filterWidth'])  if tcfg['filterWidth'] else 1
    filterSizeY = int(tcfg['filterHeight']) if tcfg['filterHeight'] else 1
    strNonLinFunc = tcfg['activationFunction']
    isTrainable = tcfg['isTrainable'] if tcfg['isTrainable'] else True
    # FIXME: parameter selection currently not implemented in WEB-UI !!!
    strBorderMode = 'same'
    tmpLayer = Convolution2D(numberFilters, filterSizeX, filterSizeY,
                             subsample=paramStride,
                             border_mode=strBorderMode,
                             activation=nonlinFunJson2Keras(strNonLinFunc))
    tmpLayer.trainable = isTrainable
    return tmpLayer

def buildLayerConvolution3D(cfgNode):
    tcfg=cfgNode.jsonParams
    # assert (cfgNode.jsonCfg['layerType']=='convolution3d')
    numberFilters = int(tcfg['filtersCount']) if tcfg['filtersCount'] else 1
    filterSizeX = int(tcfg['filterWidth'])  if tcfg['filterWidth'] else 1
    filterSizeY = int(tcfg['filterHeight']) if tcfg['filterHeight'] else 1
    filterSizeZ = int(tcfg['filterDepth'])  if tcfg['filterDepth'] else 1
    strNonLinFunc = tcfg['activationFunction']
    isTrainable = tcfg['isTrainable'] if tcfg['isTrainable'] else True
    # FIXME: parameter selection currently not implemented in WEB-UI !!!
    paramStride = (1, 1)
    strBorderMode = 'same'
    tmpLayer = Convolution3D(numberFilters, filterSizeX, filterSizeY, filterSizeZ,
                             subsample=paramStride,
                             border_mode=strBorderMode,
                             activation=nonlinFunJson2Keras(strNonLinFunc))
    tmpLayer.trainable = isTrainable
    return tmpLayer

def buildLayerPooling1D(cfgNode):
    tcfg = cfgNode.jsonParams
    # assert ( cfgNode.jsonCfg['layerType'] == 'pooling1d' )
    subsamplingSizeWidth = tcfg['subsamplingSizeWidth']
    subsamplingType = tcfg['subsamplingType']
    #FIXME: parameter selection currently not implemented in WEB-UI !!!
    parStrides = None
    parBorderMode = 'valid'
    if subsamplingType=='max_pooling':
        tmpLayer = MaxPooling1D(pool_length=subsamplingSizeWidth,
                                strides=parStrides,
                                border_mode=parBorderMode)
    else:
        tmpLayer = AveragePooling1D(pool_length=subsamplingSizeWidth,
                                strides=parStrides,
                                border_mode=parBorderMode)
    return tmpLayer

def buildLayerPooling2D(cfgNode):
    tcfg = cfgNode.jsonParams
    # assert ( cfgNode.jsonCfg['layerType'] == 'pooling2d' )
    subsamplingSizeWidth  = tcfg['subsamplingSizeWidth']
    subsamplingSizeHeight = tcfg['subsamplingSizeHeight']
    subsamplingType = tcfg['subsamplingType']
    parPoolSize = (subsamplingSizeWidth, subsamplingSizeHeight)
    #FIXME: parameter selection currently not implemented in WEB-UI !!!
    parStrides = None
    parBorderMode = 'valid'
    if subsamplingType=='max_pooling':
        tmpLayer = MaxPooling2D(pool_size=parPoolSize,
                                strides=parStrides,
                                border_mode=parBorderMode)
    else:
        tmpLayer = AveragePooling2D(pool_size=parPoolSize,
                                strides=parStrides,
                                border_mode=parBorderMode)
    return tmpLayer

def buildLayerPooling3D(cfgNode):
    # assert ( cfgNode.jsonCfg['layerType'] == 'pooling3d' )
    tcfg = cfgNode.jsonParams
    subsamplingSizeWidth  = tcfg['subsamplingSizeWidth']
    subsamplingSizeHeight = tcfg['subsamplingSizeHeight']
    subsamplingSizeDepth  = tcfg['subsamplingSizeDepth']
    subsamplingType = tcfg['subsamplingType']
    parPoolSize = (subsamplingSizeWidth, subsamplingSizeHeight, subsamplingSizeDepth)
    #FIXME: parameter selection currently not implemented in WEB-UI !!!
    parStrides = None
    parBorderMode = 'valid'
    if subsamplingType=='max_pooling':
        tmpLayer = MaxPooling3D(pool_size=parPoolSize,
                                strides=parStrides,
                                border_mode=parBorderMode)
    else:
        tmpLayer = AveragePooling3D(pool_size=parPoolSize,
                                strides=parStrides,
                                border_mode=parBorderMode)
    return tmpLayer

def buildLayerActivation(cfgNode):
    # assert (cfgNode.jsonCfg['layerType'] == 'activation')
    tcfg = cfgNode.jsonParams
    activationFunction = tcfg['activationFunction']
    activationFunction = nonlinFunJson2Keras(activationFunction)
    tmpLayer = Activation(activation=activationFunction)
    return tmpLayer

def buildLayerFlatten(cfgNode):
    # assert (cfgNode.jsonCfg['layerType'] == 'flatten')
    return Flatten()

def buildLayerDense(cfgNode):
    # assert (cfgNode.jsonCfg['layerType'] == 'dense')
    tcfg = cfgNode.jsonParams
    neuronsCount = tcfg['neuronsCount']
    activationFunction = tcfg['activationFunction']
    activationFunction = nonlinFunJson2Keras(activationFunction)
    isTrainable = tcfg['isTrainable']
    tmpLayer = Dense(output_dim=neuronsCount,
                     activation=activationFunction)
    tmpLayer.trainable = isTrainable
    return tmpLayer

if __name__ == '__main__':
    pass