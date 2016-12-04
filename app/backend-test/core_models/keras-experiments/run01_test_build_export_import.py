#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import sys
import json

import numpy as np
import matplotlib.pyplot as plt
import skimage.io as skio

import keras
from keras.models import Sequential, Model
from keras.layers import Convolution2D, MaxPooling2D, InputLayer, Dense, Flatten, merge, Input
from keras.utils.visualize_util import plot as kplot
import keras.optimizers as opt

def buildModel(inpShape=(3,128,128), numOutput=2):
    dataInput = Input(shape=inpShape)
    # conv 1
    x = Convolution2D(8, nb_col=3, nb_row=3, border_mode='same', activation='relu')(dataInput)
    x = MaxPooling2D(pool_size=(2,2))(x)
    # conv 2
    x = Convolution2D(16, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x)
    x = Convolution2D(16, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x)
    x = MaxPooling2D(pool_size=(2, 2))(x)
    # conv 3
    x = Convolution2D(32, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x)
    x = Convolution2D(32, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x)
    x = MaxPooling2D(pool_size=(2, 2))(x)
    # conv 4
    x = Convolution2D(64, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x)
    x = Convolution2D(64, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x)
    x = Convolution2D(64, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x)
    x = MaxPooling2D(pool_size=(2, 2))(x)
    x = Flatten()(x)
    x = Dense(output_dim=128, activation='relu')(x)
    x = Dense(output_dim=numOutput, activation='softmax')(x)
    model = Model(dataInput, x)
    return model

def buildModel_MultiInput(inpShape=(3,128,128), numOutput=2):
    dataInput1 = Input(shape=inpShape)
    dataInput2 = Input(shape=inpShape)
    # 1: conv 1
    x1 = Convolution2D(8, nb_col=3, nb_row=3, border_mode='same', activation='relu')(dataInput1)
    x1 = MaxPooling2D(pool_size=(2,2))(x1)
    # 1: conv 2
    x1 = Convolution2D(16, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x1)
    x1 = MaxPooling2D(pool_size=(2, 2))(x1)
    # 1: conv 3
    x1 = Convolution2D(32, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x1)
    x1 = MaxPooling2D(pool_size=(2, 2))(x1)
    # 1: conv 4
    x1 = Convolution2D(64, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x1)
    x1 = MaxPooling2D(pool_size=(2, 2))(x1)

    # 2: conv 1
    x2 = Convolution2D(8, nb_col=3, nb_row=3, border_mode='same', activation='relu')(dataInput2)
    x2 = MaxPooling2D(pool_size=(2, 2))(x2)
    # 2: conv 2
    x2 = Convolution2D(16, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x2)
    x2 = MaxPooling2D(pool_size=(2, 2))(x2)
    # 2: conv 3
    x2 = Convolution2D(32, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x2)
    x2 = MaxPooling2D(pool_size=(2, 2))(x2)
    # 2: conv 4
    x2 = Convolution2D(64, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x2)
    x2 = MaxPooling2D(pool_size=(2, 2))(x2)
    x12 = merge([x1,x2], mode='concat', concat_axis=1)
    # 1,2: conv 5
    x12 = Convolution2D(256, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x12)
    x12 = MaxPooling2D(pool_size=(2, 2))(x12)
    #
    x12 = Flatten()(x12)
    x12 = Dense(output_dim=128, activation='relu')(x12)
    x12 = Dense(output_dim=numOutput, activation='softmax')(x12)
    #
    model = Model([dataInput1, dataInput2], x12)
    return model

def buildModel_MultiInput_MultiOutput(inpShape=(3,128,128), numOutput1=5, numOutput2=2):
    dataInput1 = Input(shape=inpShape)
    dataInput2 = Input(shape=inpShape)
    # 1: conv 1
    x1 = Convolution2D(8, nb_col=3, nb_row=3, border_mode='same', activation='relu')(dataInput1)
    x1 = MaxPooling2D(pool_size=(2,2))(x1)
    # 1: conv 2
    x1 = Convolution2D(16, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x1)
    x1 = MaxPooling2D(pool_size=(2, 2))(x1)
    # 1: conv 3
    x1 = Convolution2D(32, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x1)
    x1 = MaxPooling2D(pool_size=(2, 2))(x1)

    # Output-1
    x1_1 = Convolution2D(64, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x1)
    x1_1 = MaxPooling2D(pool_size=(2, 2))(x1_1)
    x1_1 = Convolution2D(128, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x1)
    x1_1 = MaxPooling2D(pool_size=(2, 2))(x1_1)
    x1_1 = Flatten()(x1_1)
    x1_1 = Dense(output_dim=32, activation='relu')(x1_1)
    x1_1 = Dense(output_dim=numOutput1, activation='linear')(x1_1)

    # 1: conv 4
    x1 = Convolution2D(64, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x1)
    x1 = MaxPooling2D(pool_size=(2, 2))(x1)

    # 2: conv 1
    x2 = Convolution2D(8, nb_col=3, nb_row=3, border_mode='same', activation='relu')(dataInput2)
    x2 = MaxPooling2D(pool_size=(2, 2))(x2)
    # 2: conv 2
    x2 = Convolution2D(16, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x2)
    x2 = MaxPooling2D(pool_size=(2, 2))(x2)
    # 2: conv 3
    x2 = Convolution2D(32, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x2)
    x2 = MaxPooling2D(pool_size=(2, 2))(x2)
    # 2: conv 4
    x2 = Convolution2D(64, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x2)
    x2 = MaxPooling2D(pool_size=(2, 2))(x2)
    x12 = merge([x1,x2], mode='concat', concat_axis=1)
    # 1,2: conv 5
    x12 = Convolution2D(256, nb_col=3, nb_row=3, border_mode='same', activation='relu')(x12)
    x12 = MaxPooling2D(pool_size=(2, 2))(x12)
    #
    x12 = Flatten()(x12)
    x12 = Dense(output_dim=128, activation='relu')(x12)
    x12 = Dense(output_dim=numOutput2, activation='softmax')(x12)
    #
    model = Model([dataInput1, dataInput2], [x1_1, x12])
    return model

#################################
if __name__ == '__main__':
    # model = buildModel()
    # model = buildModel_MultiInput()
    model = buildModel_MultiInput_MultiOutput()
    cfgJson = json.loads(model.to_json())
    strJson = json.dumps(cfgJson, indent=4)
    strYaml = model.to_yaml()
    print (strJson)

    foutModelConfig = 'model_config.json'
    with open(foutModelConfig, 'w') as f:
        f.write(strJson)
    fimgModel = 'model.jpg'
    kplot(model, fimgModel, show_shapes=True)
    plt.imshow(skio.imread(fimgModel))
    plt.show()
    print ('----------')