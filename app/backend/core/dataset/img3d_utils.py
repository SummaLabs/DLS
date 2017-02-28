#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import numpy as np
import skimage as sk
import skimage.transform as sktf
from skimage.transform import SimilarityTransform
from skimage.transform import warp as skwarp
import nibabel as nib

#######################################
class ImageTransformer3D:
    def __init__(self):
        pass

    @staticmethod
    def transformSquashImage(pimg, out_shape, order=4, preserve_range=True, mode='edge'):
        if len(out_shape)<3:
            raise Exception('Invalid shape: valid shape have a 3 dim')
        return sktf.resize(pimg, out_shape, order=order, preserve_range=preserve_range, mode=mode)

    @staticmethod
    def transformFillImage(pimg, out_shape):
        pass

    @staticmethod
    def transformCropImage(pimg, out_shape):
        pass

#######################################
if __name__ == '__main__':
    pass