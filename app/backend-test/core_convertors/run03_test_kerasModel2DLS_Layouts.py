#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
os.environ['THEANO_FLAGS'] = "device=cpu"

import glob
import json
import networkx as nx
import matplotlib.pyplot as plt

from pprint import pprint

from app.backend.core.models.convertors import keras2dls


#########################################
pathWithDatasets='../../../data-test/test_caffe_models'
pathOutModels='../../../data/network/saved'

lstLayouts=['dot', 'neato', 'fdp']

#########################################
if __name__ == '__main__':
    lstModelsPaths = glob.glob('%s/*-kerasmodel.json' % pathWithDatasets)
    # lstModelsPaths = glob.glob('%s/bvlc_alexnet*-kerasmodel.json' % pathWithDatasets)
    pprint(lstModelsPaths)
    #
    for ii,pp in enumerate(lstModelsPaths):
        for ll in lstLayouts:
            theFinalDLSModel = keras2dls.convertKeras2DLS(pp, graphvizLayout=ll)
            foutModel=os.path.abspath('%s/%s_converted_%s.json' % (pathOutModels, os.path.splitext(os.path.basename(pp))[0], ll))
            print ('[%d/%d] convert: %s --> [%s]' % (ii, len(lstModelsPaths), os.path.basename(pp), foutModel))
            with open(foutModel, 'w') as f:
                f.write(json.dumps(theFinalDLSModel, indent=4))
        # nx.draw(theGraph, theGraphPos)
        # plt.show()
