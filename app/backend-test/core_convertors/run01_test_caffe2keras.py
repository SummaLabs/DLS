#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
os.environ['THEANO_FLAGS'] = "device=cpu"

import glob
import json

import skimage.io as io
import matplotlib.pyplot as plt

from pprint import pprint

import keras
from keras.utils.visualize_util import plot as kplot

from app.backend.core.models.convertors.caffe import convert as caffeConvert
from app.backend.core.models.convertors.caffe.extra_layers import dictExtraLayers

pathWithDatasets='../../../data-test/test_caffe_models'

if __name__ == '__main__':
    lstModelsPaths=[{
        'proto':    os.path.abspath(os.path.join(pathWithDatasets, '%s.prototxt'   % os.path.basename(os.path.splitext(xx)[0]) )),
        'weights':  os.path.abspath(os.path.join(pathWithDatasets, '%s.caffemodel' % os.path.basename(os.path.splitext(xx)[0]) ))
    } for xx in glob.glob('%s/*.prototxt' % pathWithDatasets)]
    pprint(lstModelsPaths)
    numProto = len(lstModelsPaths)
    plt.figure()
    for ii,pp in enumerate(lstModelsPaths):
        pathProto   = pp['proto']
        pathWeights = pp['weights']
        # (1) convert Caffe->Keras
        pathKerasModelOutput = '%s-kerasmodel.json' % os.path.splitext(pathProto)[0]
        print ('[%d/%d] %s --> %s' % (ii, len(lstModelsPaths), pathProto, pathKerasModelOutput))
        try:
            model = caffeConvert.caffe_to_keras(pathProto, caffemodelPath=None, debug=False)
            with open(pathKerasModelOutput, 'w') as f:
                f.write(model.to_json(indent=4))
            # (2) try to load and plot Keras model
            with open(pathKerasModelOutput, 'r') as f:
                jsonData = f.read()
            kerasModel = keras.models.model_from_json(jsonData, custom_objects=dictExtraLayers)
            pathKerasModelImage = '%s-kerasmodel.jpg' % os.path.splitext(pathProto)[0]
            kplot(kerasModel, to_file=pathKerasModelImage, show_shapes=True)
            img = io.imread(pathKerasModelImage)
            plt.subplot(1,numProto,ii+1)
            plt.imshow(img)
            plt.title(os.path.splitext(os.path.basename(pathProto))[0])
        except Exception as err:
            print ('\t**ERROR** Cant convert and visualize model [%s] : %s, skip...' % (pathProto, err))
    plt.show()
