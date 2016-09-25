#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import app.backend.core.utils as dlsutils
import json

import skimage.io as io
import matplotlib.pyplot as plt
from keras.utils.visualize_util import plot as kplot

from app.backend.core.datasets.dbpreview import DatasetsWatcher, DatasetImage2dInfo
from app.backend.core.models.flow_parser import DLSDesignerFlowsParser
from app.backend.core.models.batcher_image2d import BatcherImage2DLMDB
from app.backend.core.models.keras_trainer_v3 import KerasTrainer

pathTestModel='../../../data-test/test-models-json/test_cnn1.json'

if __name__ == '__main__':
    dirData     = dlsutils.getPathForDatasetDir()
    dirModels   = dlsutils.getPathForModelsDir()
    dbWatcher = DatasetsWatcher(dirData)
    dbWatcher.refreshDatasetsInfo()
    assert ( len(dbWatcher.dictDbInfo.keys())>0 )
    dbInfoTest = dbWatcher.dictDbInfo[dbWatcher.dictDbInfo.keys()[0]]
    print ('Dataset for tests : [ %s ]' % dbInfoTest.__str__())
    #
    with open(pathTestModel, 'r') as f:
        jsonModelData = json.load(f)
    modelParser  = DLSDesignerFlowsParser(jsonModelData)
    modelTrainer, modelConfig = modelParser.buildKerasTrainer()
    batcherDB = BatcherImage2DLMDB(dbInfoTest.pathDB)
    #
    modelTrainerAdjusted = modelTrainer.adjustModelInputOutput2DBData(modelTrainer.model, batcherDB)
    for ii,ll in enumerate(modelTrainerAdjusted.layers):
        print ('[%d/%d] : %s, shape: inp=%s, out=%s' % (ii,len(modelTrainerAdjusted.layers), ll, ll.input_shape, ll.output_shape))
    print ('*** Total Model params: %d' % modelTrainerAdjusted.count_params())
    #
    fimg = '/tmp/keras_draw.png'
    kplot(modelTrainerAdjusted, to_file=fimg, show_shapes=True)
    img = io.imread(fimg)
    plt.imshow(img)
    plt.show()

