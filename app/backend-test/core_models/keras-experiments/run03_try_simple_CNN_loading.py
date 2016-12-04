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
if __name__ == '__main__':
    foutJson = 'test-model-cnn.json'
    if not os.path.isfile(foutJson):
        raise Exception('Cant find model-config file [%s]' % foutJson)
    with open(foutJson, 'r') as f:
        model = keras.models.model_from_json(f.read())
    model.summary()
    model.compile(optimizer='rmsprop', loss='categorical_crossentropy', metrics=['accuracy'])
    pass
