#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import keras
import keras.layers as kl

if __name__ == '__main__':
    tlayer = kl.InputLayer(input_shape=(3, 3, 3))
    print (tlayer.get_config())


