#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json
from keras.models import Model
from keras.layers import Input, Conv2D, MaxPool2D, Flatten, Dense

if __name__ == '__main__':
    inpData = Input(shape=(3,128,128))
    x = Conv2D(filters=8,  kernel_size=(3, 3), activation='relu')(inpData)
    x = MaxPool2D(pool_size=(2,2))(x)
    #
    x = Conv2D(filters=16, kernel_size=(3, 3), activation='relu')(x)
    x = MaxPool2D(pool_size=(2, 2))(x)
    #
    x = Conv2D(filters=32, kernel_size=(3, 3), activation='relu')(x)
    x = MaxPool2D(pool_size=(2, 2))(x)
    #
    x = Flatten()(x)
    x = Dense(units=128, activation='relu')(x)
    x = Dense(units=2, activation='softmax')(x)
    model = Model(inputs=[inpData], outputs=[x])
    modelJson = model.to_json()
    print (json.dumps(json.loads(modelJson), indent=4))