#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import skimage.io as io
import matplotlib.pyplot as plt

from keras.utils.visualize_util import plot as kplot

from app.backend.core.models.flow_parser import DLSDesignerFlowsParser

if __name__ == '__main__':
    pathModelJson='../../../data-test/test-models-json/test_cnn1.json'
    flowParser = DLSDesignerFlowsParser(pathModelJson)
    flowParser.cleanAndValidate()
    print ('Model-flow isOk: [%s]' % flowParser.isOk())
    kerasTrainer = flowParser.buildKerasTrainer()
    print (kerasTrainer.model)
    #
    fimg = '/tmp/keras_draw.png'
    kplot(kerasTrainer.model, to_file=fimg, show_shapes=True)
    img = io.imread(fimg)
    plt.imshow(img)
    plt.show()
