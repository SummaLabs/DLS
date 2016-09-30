#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import glob
import json
import networkx as nx
import matplotlib.pyplot as plt

from pprint import pprint

from app.backend.core.models.convertors import keras2dls


#########################################
pathWithDatasets='../../../data-test/test_caffe_models'
pathOutModels='../../../data/network/saved'

#########################################
if __name__ == '__main__':
    lstModelsPaths = glob.glob('%s/*-kerasmodel.json' % pathWithDatasets)
    pprint(lstModelsPaths)
    #
    for ii,pp in enumerate(lstModelsPaths):
        theFinalDLSModel = keras2dls.convertKeras2DLS(pp)
        foutModel=os.path.abspath('%s/%s_converted.json' % (pathOutModels, os.path.splitext(os.path.basename(pp))[0]))
        print ('[%d/%d] convert: %s --> [%s]' % (ii, len(lstModelsPaths), os.path.basename(pp), foutModel))
        with open(foutModel, 'w') as f:
            f.write(json.dumps(theFinalDLSModel, indent=4))
        # nx.draw(theGraph, theGraphPos)
        # plt.show()
