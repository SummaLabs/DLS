#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json
import os
import skimage.io as skio
import matplotlib.pyplot as plt
import numpy as np

import keras
from keras.models import Model
from keras.layers import Input, Convolution2D, MaxPooling2D, Flatten, Dense
from keras.utils.visualize_util import plot as kplot

##################################
def buildModelCNN(inpShape=(3,128,128), sizFlt = 3, numFltStart=16, numCls=2, numHidden=128, funact='relu'):
    inpData = Input(shape=inpShape)
    # Conv 1'st
    x = Convolution2D(nb_filter=1 * numFltStart, nb_row=sizFlt, nb_col=sizFlt, activation=funact,
                      border_mode='same')(inpData)
    x = MaxPooling2D(pool_size=(2,2))(x)
    # Conv 2'nd
    x = Convolution2D(nb_filter=2 * numFltStart, nb_row=sizFlt, nb_col=sizFlt, activation=funact,
                      border_mode='same')(x)
    x = MaxPooling2D(pool_size=(2,2))(x)
    # Conv 3'rd
    x = Convolution2D(nb_filter=3 * numFltStart, nb_row=sizFlt, nb_col=sizFlt, activation=funact,
                      border_mode='same')(x)
    x = MaxPooling2D(pool_size=(2, 2))(x)
    # Conv 4'th
    x = Convolution2D(nb_filter=4 * numFltStart, nb_row=sizFlt, nb_col=sizFlt, activation=funact,
                      border_mode='same')(x)
    x = MaxPooling2D(pool_size=(2, 2))(x)
    # Conv 5'th
    x = Convolution2D(nb_filter=5 * numFltStart, nb_row=sizFlt, nb_col=sizFlt, activation=funact,
                      border_mode='same')(x)
    x = MaxPooling2D(pool_size=(2, 2))(x)
    #
    x = Flatten()(x)
    if numHidden is not None:
        x = Dense(output_dim=numHidden, activation=funact)(x)
    x = Dense(output_dim=numCls, activation='softmax')(x)
    retModel = Model(inpData, x)
    return retModel

##################################
def getBasicModelTemplate(modelName='model_1'):
    retTemplate = {
        "class_name":   "Model",
        "keras_version": keras.__version__,
        "config": {
            "name": "%s" % modelName,
            "layers" : [],
            "input_layers": [],
            "output_layers": [],
        }
    }
    return retTemplate

def generateModelJsonDict(model):
    tmpl = getBasicModelTemplate()
    tmpLayers = []
    for ii,ll in enumerate(model.layers):
        tmp = {
            'class_name': type(ll).__name__,
            'name': ll.name,
            'config': ll.get_config(),
        }
        if ii==0:
            tmp['inbound_nodes'] = []
        else:
            tmp['inbound_nodes'] = [[
                [
                    model.layers[ii-1].name,
                    0,
                    0
                ]
            ]]
        tmpLayers.append(tmp)
    tmpl['config']['layers'] = tmpLayers
    tmpl['config']['input_layers'] = [
        [
            model.layers[0].name,
            0,
            0
        ]
    ]
    tmpl['config']['output_layers'] = [
        [
            model.layers[-1].name,
            0,
            0
        ]
    ]
    return tmpl

##################################
if __name__ == '__main__':
    model = buildModelCNN(inpShape=(3, 128, 128))
    fimgModel = 'keras-model-cnn.jpg'
    kplot(model, fimgModel, show_shapes=True)
    # plt.imshow(skio.imread(fimgModel))
    # plt.show()
    model.summary()
    print ('------')
    numLayers = len(model.layers)
    for ii,ll in enumerate(model.layers):
        print ('[%d/%d] : %s' % (ii, numLayers, ll))
    modelJson = generateModelJsonDict(model)
    print ('----------------------')
    print (json.dumps(modelJson, indent=4))
    foutJson = 'test-model-cnn.json'
    with open(foutJson, 'w') as f:
        json.dump(modelJson, f, indent=4)
        # print (json.dumps(modelJson, indent=4))

