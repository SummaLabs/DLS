#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json

####################################
# values: (is Available, is Correct but currently not available)
dictAvailableConnectionsFromTo = {
    'datainput' : {
        'datainput'     : (False, None),
        'convolution1d' : (True,  None),
        'convolution2d' : (True,  None),
        'convolution3d' : (True,  None),
        'pooling1d'     : (True,  None),
        'pooling2d'     : (True,  None),
        'pooling3d'     : (True,  None),
        'flatten'       : (True,  None),
        'activation'    : (True,  None),
        'merge'         : (True,  None),
        'dense'         : (True,  None),
        'dataoutput'    : (False, None)
    },
    'convolution1d' : {
        'datainput'     : (False, None),
        'convolution1d' : (True,  None),
        'convolution2d' : (False,  None),
        'convolution3d' : (False,  None),
        'pooling1d'     : (True,  None),
        'pooling2d'     : (False,  None),
        'pooling3d'     : (False,  None),
        'flatten'       : (True,  None),
        'activation'    : (True,  None),
        'merge'         : (True,  None),
        'dense'         : (True,  None),
        'dataoutput'    : (False, None)
    },
    'convolution2d': {
        'datainput'     : (False, None),
        'convolution1d' : (False, None),
        'convolution2d' : (True, None),
        'convolution3d' : (False, None),
        'pooling1d'     : (False, None),
        'pooling2d'     : (True, None),
        'pooling3d'     : (False, None),
        'flatten'       : (True, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'dataoutput'    : (False, None)
    },
    'convolution3d': {
        'datainput'     : (False, None),
        'convolution1d' : (False, None),
        'convolution2d' : (False, None),
        'convolution3d' : (True, None),
        'pooling1d'     : (False, None),
        'pooling2d'     : (False, None),
        'pooling3d'     : (True, None),
        'flatten'       : (True, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'dataoutput'    : (False, None)
    },
    'pooling1d': {
        'datainput'     : (False, None),
        'convolution1d' : (True, None),
        'convolution2d' : (False, None),
        'convolution3d' : (False, None),
        'pooling1d'     : (True, None),
        'pooling2d'     : (False, None),
        'pooling3d'     : (False, None),
        'flatten'       : (True, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'dataoutput'    : (False, None)
    },
    'pooling2d': {
        'datainput'     : (False, None),
        'convolution1d' : (False, None),
        'convolution2d' : (True, None),
        'convolution3d' : (False, None),
        'pooling1d'     : (False, None),
        'pooling2d'     : (True, None),
        'pooling3d'     : (False, None),
        'flatten'       : (True, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'dataoutput'    : (False, None)
    },
    'pooling3d': {
        'datainput'     : (False, None),
        'convolution1d' : (False, None),
        'convolution2d' : (False, None),
        'convolution3d' : (True, None),
        'pooling1d'     : (False, None),
        'pooling2d'     : (False, None),
        'pooling3d'     : (True, None),
        'flatten'       : (True, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'dataoutput'    : (False, None)
    },
    'flatten': {
        'datainput'     : (False, None),
        'convolution1d' : (True, None),
        'convolution2d' : (False, None),
        'convolution3d' : (False, None),
        'pooling1d'     : (True, None),
        'pooling2d'     : (False, None),
        'pooling3d'     : (False, None),
        'flatten'       : (False, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'dataoutput'    : (False, None)
    },
    'activation': {
        'datainput'     : (False, None),
        'convolution1d' : (True, None),
        'convolution2d' : (True, None),
        'convolution3d' : (True, None),
        'pooling1d'     : (True, None),
        'pooling2d'     : (True, None),
        'pooling3d'     : (True, None),
        'flatten'       : (True, None),
        'activation'    : (False, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'dataoutput'    : (True, None)
    },
    'merge': {
        'datainput'     : (False, None),
        'convolution1d' : (True, None),
        'convolution2d' : (False, None),
        'convolution3d' : (False, None),
        'pooling1d'     : (True, None),
        'pooling2d'     : (False, None),
        'pooling3d'     : (False, None),
        'flatten'       : (True, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True, None),
        'dataoutput'    : (True, None)
    },
    'dense' : {
        'datainput'     : (False, None),
        'convolution1d' : (True, None),
        'convolution2d' : (False, None),
        'convolution3d' : (False, None),
        'pooling1d'     : (True, None),
        'pooling2d'     : (False, None),
        'pooling3d'     : (False, None),
        'flatten'       : (True, None),
        'activation'    : (True, None),
        'merge'         : (True, None),
        'dense'         : (True,  None),
        'dataoutput'    : (True,  None)
    },
    'dataoutput' : {
        'datainput'     : (False, None),
        'convolution1d' : (False, None),
        'convolution2d' : (False, None),
        'convolution3d' : (False, None),
        'pooling1d'     : (False, None),
        'pooling2d'     : (False, None),
        'pooling3d'     : (False, None),
        'flatten'       : (False, None),
        'activation'    : (False, None),
        'merge'         : (False, None),
        'dense'         : (False, None),
        'dataoutput'    : (False, None)
    }
}

dictRequiredFields = {
    'datainput'     : ['datasetId'],
    'convolution1d' : ['filtersCount', 'filterWidth', 'activationFunction', 'isTrainable'],
    'convolution2d' : ['filtersCount', 'filterWidth', 'filterHeight', 'activationFunction', 'isTrainable'],
    'convolution3d' : ['filtersCount', 'filterWidth', 'filterHeight', 'filterDepth', 'activationFunction', 'isTrainable'],
    'pooling1d'     : ['subsamplingSizeWidth', 'subsamplingType'],
    'pooling2d'     : ['subsamplingSizeWidth', 'subsamplingSizeHeight', 'subsamplingType'],
    'pooling3d'     : ['subsamplingSizeWidth', 'subsamplingSizeHeight', 'subsamplingSizeDepth', 'subsamplingType'],
    'flatten'       : [],
    'activation'    : ['activationFunction'],
    'merge'         : ['mergeType', 'mergeAxis'],
    'dense'         : ['neuronsCount', 'activationFunction', 'isTrainable'],
    'dataoutput'    : ['lossFunction', 'datasetId']
}

if __name__ == '__main__':
    pass