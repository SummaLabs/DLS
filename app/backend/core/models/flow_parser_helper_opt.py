#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

from keras.optimizers import SGD, RMSprop, Adagrad, Adadelta, Adam, Adamax

#########################
def getOptimizerJson2Keras(strOpt, parLR=0.1):
    # FIXME: only Learning Rate is processed correctly, other Optimizer-specific field is defined by default...
    if strOpt == "SGD":
        return SGD(lr=parLR)
    elif strOpt == "RMSprop":
        return RMSprop(lr=parLR)
    elif strOpt == "Adagrad":
        return Adagrad(lr=parLR)
    elif strOpt == "Adadelta":
        return Adadelta(lr=parLR)
    elif strOpt == "Adam":
        return Adam(lr=parLR)
    elif strOpt == "Adamax":
        return Adamax(lr=parLR)
    elif strOpt == "Nadam":
        return None
    else:
        return None

def getKerasOptimizerName(optObj):
    if isinstance(optObj, SGD):
        return 'SGD'
    elif isinstance(optObj, RMSprop):
        return 'RMSprop'
    elif isinstance(optObj, Adagrad):
        return 'Adagrad'
    elif isinstance(optObj, Adadelta):
        return 'Adadelta'
    elif isinstance(optObj, Adam):
        return 'Adam'
    elif isinstance(optObj, Adamax):
        return 'Adamax'
    else:
        return None

if __name__ == '__main__':
    pass