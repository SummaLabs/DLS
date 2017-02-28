#!/usr/bin/python
# -*- coding: utf-8 -*-

import os
import numpy as np
import skimage as sk
import skimage.transform as sktf
from skimage.transform import SimilarityTransform
from skimage.transform import warp as skwarp

#######################################
class ImageTransformer2D:
    def __init__(self):
        pass

    @staticmethod
    def transformSquashImage(pimg, out_shape):
        tret = sktf.resize(pimg, out_shape)
        return tret

    @staticmethod
    def transformFillImage(pimg, out_shape):
        nr = pimg.shape[0]
        nc = pimg.shape[1]
        if (nr == out_shape[0] and nc == out_shape[1]):
            return pimg.copy()
        sOut = float(out_shape[0]) / float(out_shape[1])
        sInp = float(nr) / float(nc)
        if sOut > sInp:
            tmpShape = (int(nr * float(out_shape[1]) / nc), out_shape[1])
        else:
            tmpShape = (out_shape[0], int(nc * float(out_shape[0]) / nr))
        timg = sktf.resize(pimg, tmpShape, preserve_range=True)
        timgShape = timg.shape[:2]
        nch = 1 if timg.ndim<3 else timg.shape[-1]
        p0 = (int((out_shape[0] - timgShape[0]) / 2.), int((out_shape[1] - timgShape[1]) / 2.))
        if nch == 1:
            tret = np.zeros(out_shape, dtype=pimg.dtype)
            tret[p0[0]:p0[0] + timg.shape[0], p0[1]:p0[1] + timg.shape[1]] = timg
        else:
            tret = np.zeros((out_shape[0], out_shape[1], nch), dtype=pimg.dtype)
            tret[p0[0]:p0[0] + timg.shape[0], p0[1]:p0[1] + timg.shape[1], :] = timg
        return tret

    @staticmethod
    def transformCropImage(pimg, out_shape):
        # TODO: check performance: code is realy clean, but...
        sizInp = (pimg.shape[1], pimg.shape[0])
        sizOut = (out_shape[1], out_shape[0])
        trf = SimilarityTransform(translation=(-0.5 * (sizOut[0] - sizInp[0]), -0.5 * (sizOut[1] - sizInp[1])))
        timgw = skwarp(pimg, trf, output_shape=out_shape)
        return timgw

#######################################
if __name__ == '__main__':
    import skimage.data as skdata
    import matplotlib.pyplot as plt
    timg = skdata.astronaut()
    lstShapes = [(256,256), (900,300), (300,900)]
    lstTTypes = [ImageTransformer2D.transformCropImage,
                 ImageTransformer2D.transformFillImage,
                 ImageTransformer2D.transformSquashImage]
    numShapes = len(lstShapes)
    numTTypes = len(lstTTypes)
    cnt = 0
    for ss in lstShapes:
        for tt in lstTTypes:
            plt.subplot(numShapes, numTTypes, cnt+1)
            imgT = tt(timg, ss)
            plt.imshow(imgT)
            plt.title('%s : %s' % (tt.__name__, list(ss)))
            cnt += 1
    plt.show()