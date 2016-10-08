#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
os.environ['THEANO_FLAGS'] = "device=cpu"

import glob
import json
import networkx as nx
import matplotlib.pyplot as plt
import skimage.io as io

from pprint import pprint

from app.backend.core.models.convertors import keras2dls

import pygraphviz as pyg


#########################################
pathWithDatasets='../../../data-test/test_caffe_models'
pathOutModels='../../../data/network/saved'

lstLayouts=['dot', 'neato']

#########################################
if __name__ == '__main__':
    # lstModelsPaths = glob.glob('%s/*-kerasmodel.json' % pathWithDatasets)
    # lstModelsPaths = glob.glob('%s/bvlc_alexnet*-kerasmodel.json' % pathWithDatasets)
    lstModelsPaths = glob.glob('%s/bvlc_googlenet*-kerasmodel.json' % pathWithDatasets)
    pprint(lstModelsPaths)
    #
    for ii,pp in enumerate(lstModelsPaths):
        theFinalDLSModel = keras2dls.convertKeras2DLS(pp, graphvizLayout=None)
        #
        lstLayers = theFinalDLSModel['layers']
        theGraph = pyg.AGraph()
        for LL in lstLayers:
            tid = LL['id']
            for ww in LL['wires']:
                theGraph.add_edge(tid, ww)
        theGraph.layout(prog='dot', args="-Grankdir=TB")
        print(theGraph.nodes())
        fout = 'test_pygraph.png'
        theGraph.draw(fout)
        plt.imshow(io.imread(fout))
        plt.show()
        #
        foutModel=os.path.abspath('%s/%s_converted_%s.json' % (pathOutModels, os.path.splitext(os.path.basename(pp))[0], ll))
        print ('[%d/%d] convert: %s --> [%s]' % (ii, len(lstModelsPaths), os.path.basename(pp), foutModel))
        with open(foutModel, 'w') as f:
            f.write(json.dumps(theFinalDLSModel, indent=4))
    # nx.draw(theGraph, theGraphPos)
    # plt.show()
