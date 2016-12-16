#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json
import keras
import skimage.io as skio
import matplotlib.pyplot as plt
from keras.utils.visualize_util import plot as kplot

from core01_network_parser import DLSDesignerFlowsParserV2

import app.backend.core.utils as dlsutils
from app.backend.core.datasets.dbpreview import DatasetsWatcher


######################################
if __name__ == '__main__':
    dirData = dlsutils.getPathForDatasetDir()
    dbWatcher = DatasetsWatcher(dirData)
    dbWatcher.refreshDatasetsInfo()
    #
    foutJson = 'keras-model-generated-db.json'
    # fnFlowJson = '../../../../data/network/saved/testnet_multi_input_multi_output_v1.json'
    fnFlowJson = '../../../../data/network/saved/test_simple_cnn_model1.json'
    flowParser = DLSDesignerFlowsParserV2(fnFlowJson)
    flowParser.cleanAndValidate()
    # (1) Build connected and validated Model Node-flow (DLS-model-representation)
    flowParser.buildConnectedFlow()
    # (2) Generate dict-based Json Kearas model (from DLS model representation)
    modelJson = flowParser.generateModelKerasConfigJson(dbWatcher=dbWatcher)
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
