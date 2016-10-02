#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import json
import networkx as nx
import pygraphviz as pyg
import numpy as np
import keras

import app.backend.core.utils as dlsutils

from pprint import pprint

from caffe.extra_layers import dictExtraLayers


#########################################
dictKerasClass2DLSLayers={
    'Convolution2D': {
        'type':             'convolution',
        'name':             'Convolution2D',
        'params': {
            'trainable':    'isTrainable',
            'nb_col':       'filterHeight',
            'nb_row':       'filterWidth',
            'nb_filter':    'filtersCount',
            'activation':   'activationFunction'
        },
        'template':         'frontend/components/layers/convol/node-test-2.svg'
    },
    'InputLayer': {
        'type':         'data',
        'name':         'InputLayer',
        'params':       {},
        'template':     'frontend/components/layers/data/node-test-2.svg'
    },
    'Dense': {
        'type':             'dense',
        'name':             'Dense',
        'params': {
            'trainable':    'isTrainable',
            'activation':   'activationFunction',
            'output_dim':   'neuronsCount'
        },
        'template':         'frontend/components/layers/dense/node-test-4.svg'
    }
}
#########################################
def convetLayersParamsKeras2DLS(kerasLayer):
    fmtId = '%s_0x%x'
    layerClassName = type(kerasLayer).__name__
    layerConfig = kerasLayer.get_config()
    retLayerId = fmtId % (type(kerasLayer).__name__, kerasLayer.__hash__())
    retWires = ['%s_0x%x' % (type(nn.outbound_layer).__name__, nn.outbound_layer.__hash__()) for nn in kerasLayer.outbound_nodes]
    if layerClassName in dictKerasClass2DLSLayers.keys():
        subDict=dictKerasClass2DLSLayers[layerClassName]
        retParams = {
            'layerType':  subDict['type'],
            'name':     '%s_%s' % (subDict['name'], kerasLayer.name),
            'template': subDict['template']
        }
        tmpParams={}
        for pp in layerConfig.keys():
            if pp in subDict['params'].keys():
                keyDLS = subDict['params'][pp]
                tmpParams[keyDLS] = layerConfig[pp]
        retParams['params'] = tmpParams
    else:
        retParams = {
            'layerType':  layerClassName,
            'name':     '*%s_%s' % (layerClassName, kerasLayer.name),
            'params':   {},
            'template': 'frontend/components/layers/dense/layer_with_shapes_exp.svg'
        }
    retParams['wires'] = retWires
    retParams['id'] = retLayerId
    return (retLayerId, retParams)

def generateCoordsForLayersNX(dictDlsLayers, graphvizLayout, isHorizontal):
    theGraph = nx.Graph()
    for kk, vv in dictDlsLayers.items():
        for ll in vv['cfg']['wires']:
            theGraph.add_edge(kk, ll)
    if graphvizLayout is None:
        theGraphPos = nx.spectral_layout(theGraph)
        for kk in theGraphPos.keys():
            tpos = (1200 * theGraphPos[kk]).astype(np.int)
            theGraphPos[kk] = (tpos[0], tpos[1])
    else:
        if isHorizontal:
            pArgs = '-Grankdir=TB'
        else:
            pArgs = '-Grankdir=LR'
        theGraphPos = nx.nx_agraph.graphviz_layout(theGraph, prog=graphvizLayout, args=pArgs)
        for kk in theGraphPos.keys():
            theGraphPos[kk] = (2 * int(theGraphPos[kk][0]), 2 * int(theGraphPos[kk][1]))
    return theGraphPos

def generateCoordsForLayersPG(dictDlsLayers, graphvizLayout, isHorizontal):
    theGraph = pyg.AGraph()
    for kk, vv in dictDlsLayers.items():
        for ll in vv['cfg']['wires']:
            theGraph.add_edge(kk, ll)
    if isHorizontal:
        pArgs = '-Grankdir=LR'
    else:
        pArgs = '-Grankdir=TB'
    if graphvizLayout is None:
        graphvizLayout = 'dot'
    theGraph.layout(prog=graphvizLayout, args=pArgs)
    theGraphPos={}
    for kk in dictDlsLayers.keys():
        tnode = theGraph.get_node(kk)
        tpos  = [int(float(xx)) for xx in tnode.attr['pos'].split(',')]
        theGraphPos[kk] = tuple(tpos)
    return theGraphPos

def convertKeras2DLS(dataJson, isDebug=False, graphvizLayout='dot', isHorizontal=True):
    if isinstance(dataJson, str) or isinstance(dataJson, unicode):
        outModelName = os.path.splitext(os.path.basename(dataJson))[0]
        with open(dataJson, 'r') as f:
            dataJson = f.read()
    else:
        outModelName = dlsutils.getUniqueTaskId('Imported_Model')
    kerasModel = keras.models.model_from_json(dataJson, custom_objects=dictExtraLayers)
    tmpDictLayers = {}
    for kk, layer in enumerate(kerasModel.layers):
        layerClassName = type(layer).__name__
        layerId, layerParams = convetLayersParamsKeras2DLS(layer)
        tmpDictLayers[layerId] = {
            'id': layerId,
            'cfg': layerParams
        }
        if isDebug:
            print ('[%d] %s --> %s' % (kk, layerClassName, layerParams['wires']))
    if isDebug:
        pprint(tmpDictLayers)
    # theGraphPos = generateCoordsForLayersNX(tmpDictLayers, graphvizLayout=graphvizLayout, isHorizontal=isHorizontal)
    theGraphPos = generateCoordsForLayersPG(tmpDictLayers, graphvizLayout=graphvizLayout, isHorizontal=isHorizontal)
    #
    theFinalLayers = []
    for kk, vv in tmpDictLayers.items():
        tcfg = vv['cfg']
        tpos = theGraphPos[kk]
        tcfg['pos'] = {
            'x': tpos[0],
            'y': tpos[1]
        }
        theFinalLayers.append(tcfg)
    #
    theFinalDLSModel = {
        'name': outModelName,
        'description': '',
        'layers': theFinalLayers
    }
    return theFinalDLSModel

#########################################
if __name__ == '__main__':
    pass