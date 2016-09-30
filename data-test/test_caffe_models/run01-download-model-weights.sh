#!/bin/bash


wget -c http://www.robots.ox.ac.uk/~vgg/software/very_deep/caffe/VGG_ILSVRC_16_layers.caffemodel -O VGG_ILSVRC_16_layers.caffemodel-old

wget -c http://www.robots.ox.ac.uk/~vgg/software/very_deep/caffe/VGG_ILSVRC_19_layers.caffemodel -O VGG_ILSVRC_19_layers.caffemodel-old

wget -c https://s3.amazonaws.com/jgoode/oxford102.caffemodel -O Oxford102CaffeNet.caffemodel-old

wget -c http://dl.caffe.berkeleyvision.org/bvlc_alexnet.caffemodel -O http://dl.caffe.berkeleyvision.org/bvlc_alexnet.caffemodel-old

wget -c http://www.cs.bu.edu/groups/ivc/data/SOS/AlexNet_SalObjSub.caffemodel -O AlexNet_SalObjSub.caffemodel-old

wget -c http://dl.caffe.berkeleyvision.org/bvlc_reference_caffenet.caffemodel bvlc_reference_caffenet.caffemodel-old
