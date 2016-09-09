#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import numpy as np
import skimage as sk
import skimage.io as skio
import skimage.transform as sktr
from skimage.transform import warp as skwarp
from skimage.transform import SimilarityTransform
import skimage.color as skcolor
import copy
import matplotlib.pyplot as plt
from dbconfig import TFTypes, DBImage2DConfig
import skimage.io as skio
import PIL.Image
import dlscaffe.caffedls_pb2 as dlscaffe_pb2

try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO


#################################################
class ImageTransformer2D:
    meanImage = None
    counterMean = 0
    localCfg = None

    def __init__(self, parCfg=None):
        if parCfg is not None:
            self.initFromConfig(parCfg)

    def isInitialized(self):
        return (self.localCfg is not None)

    def initFromConfig(self, parCfg):
        self.localCfg = copy.copy(parCfg)
        self.resetMean()

    def resetMean(self):
        self.meanImage = None
        self.counterMean = 0

    def getMeanImage(self, outType=np.uint8, isReshapeFinal=False):
        if self.meanImage is not None:
            # FIXME: check this point: uint8 by-defaut is a really good idea?
            tret = (255. * self.meanImage / self.counterMean).astype(outType)
            if isReshapeFinal:
                if len(tret.shape) == 2:
                    return tret.reshape((1, tret.shape[0], tret.shape[1]))
                else:
                    return tret.transpose((2, 0, 1))
            else:
                return tret
        else:
            return None

    def getMeanValues(self):
        if self.meanImage is not None:
            tmp = self.getMeanImage(outType=np.float, isReshapeFinal=True)
            return np.mean(tmp, axis=(1, 2))
        else:
            return None

    def toString(self):
        if self.localCfg is not None:
            return self.localCfg.toString()
        else:
            return "ImageTransformer() is not initialized"

    def __str__(self):
        return self.toString()

    def __repr__(self):
        return self.toString()

    @staticmethod
    def cvtImage2Datum(timg, imgEncoding, idxLabel):
        datum = dlscaffe_pb2.Datum()
        datum.channels = timg.shape[0]
        datum.width = timg.shape[2]
        datum.height = timg.shape[1]
        datum.label = idxLabel
        if imgEncoding == 'none':
            datum.data = timg.tobytes()
            datum.encoded = False
        else:
            datum.encoded = True
            if timg.shape[0] == 1:
                timg = 255. * timg.reshape((timg.shape[1], timg.shape[2]))
            else:
                timg = 255. * timg.transpose((1, 2, 0))
            # FIXME: bad perfomance? multiple conversion...
            pilImg = PIL.Image.fromarray(timg.astype(np.uint8))
            tbuff = StringIO()
            if imgEncoding == 'jpeg':
                pilImg.save(tbuff, format='jpeg')
            elif imgEncoding == 'png':
                pilImg.save(tbuff, format='png')
            else:
                pass
            datum.data = tbuff.getvalue()
        return datum

    @staticmethod
    def saveImage2BinaryBlob(timg, foutBlog):
        imgShape = timg.shape
        tblob = dlscaffe_pb2.BlobProto()
        for ii in imgShape:
            tblob.shape.dim.append(ii)
        tblob.width = imgShape[2]
        tblob.height = imgShape[1]
        tblob.depth = 1
        tblob.channels = imgShape[0]
        tblob.data.extend(timg.reshape(-1))
        with open(foutBlog, 'w') as f:
            f.write(tblob.SerializeToString())

    @staticmethod
    def loadImageFromBinaryBlog(finpBlob):
        with open(finpBlob, 'r') as f:
            tblob = dlscaffe_pb2.BlobProto()
            tblob.ParseFromString(f.read())
            print ("#width:    %d" % tblob.width)
            print ("#height:   %d" % tblob.height)
            print ("#channels: %d" % tblob.channels)
            print ("*.dim = %s" % tblob.shape.dim)
            #
            tshape = (tblob.channels, tblob.height, tblob.width)
            data = np.array(tblob.data).reshape(tshape)
            return data

    @staticmethod
    def hlpGetImageShape(pimg):
        if len(pimg.shape) > 2:
            return (pimg.shape[2], pimg.shape[0], pimg.shape[1])
        else:
            return (1, pimg.shape, pimg.shape)

    @staticmethod
    def hlpTransformCropImage(pimg, shape2DOut):
        # TODO: check performance: code is realy clean, but...
        sizInp = (pimg.shape[1], pimg.shape[0])
        sizOut = (shape2DOut[1], shape2DOut[0])
        trf = SimilarityTransform(translation=(-0.5 * (sizOut[0] - sizInp[0]), -0.5 * (sizOut[1] - sizInp[1])))
        timgw = skwarp(pimg, trf, output_shape=shape2DOut)
        return timgw

    @staticmethod
    def hlpTransformSquashImage(pimg, shape2DOut):
        tret = sktr.resize(pimg, shape2DOut)
        return tret

    @staticmethod
    def hlpTransformFillImage(pimg, shape2DOut):
        nr = pimg.shape[0]
        nc = pimg.shape[1]
        if (nr == shape2DOut[0] and nc == shape2DOut[1]):
            return pimg.copy()
        sOut = float(shape2DOut[0]) / float(shape2DOut[1])
        sInp = float(nr) / float(nc)
        if sOut > sInp:
            tmpShape = (int(nr * float(shape2DOut[1]) / nc), shape2DOut[1])
        else:
            tmpShape = (shape2DOut[0], int(nc * float(shape2DOut[0]) / nr))
        timg = sk.img_as_ubyte(sktr.resize(pimg, tmpShape))
        timgShape = ImageTransformer2D.hlpGetImageShape(timg)
        nch = timgShape[0]
        timgShape = timgShape[1:]
        p0 = (int((shape2DOut[0] - timgShape[0]) / 2.), int((shape2DOut[1] - timgShape[1]) / 2.))
        if nch == 1:
            tret = np.zeros(shape2DOut, dtype=pimg.dtype)
            tret[p0[0]:p0[0] + timg.shape[0], p0[1]:p0[1] + timg.shape[1]] = timg
        else:
            tret = np.zeros((shape2DOut[0], shape2DOut[1], nch), dtype=pimg.dtype)
            tret[p0[0]:p0[0] + timg.shape[0], p0[1]:p0[1] + timg.shape[1], :] = timg
        return tret

    def processImageFromFile(self, pathImg, isReshapeFinal=False, isAccumulateMean=False):
        if not os.path.isfile(pathImg):
            raise Exception('Cant find image file [%s]' % pathImg)
        nch = self.localCfg.getNumChannels()
        if nch == 1:
            timg = skio.imread(pathImg, as_grey=True)
        else:
            timg = skio.imread(pathImg)
        return self.processImage(timg, isReshapeFinal=isReshapeFinal, isAccumulateMean=isAccumulateMean)

    def processImage(self, pimg, isReshapeFinal=False, isAccumulateMean=False):
        # FIXME: chteck performance: copy is realy needed?
        timg = pimg.copy()
        tshp = ImageTransformer2D.hlpGetImageShape(pimg)
        inpCh = tshp[0]
        outCh = self.localCfg.getNumChannels()
        if inpCh != outCh:
            if outCh == 1:
                # input is Color, but out is Gray:
                timg = skcolor.rgb2gray(timg)
            else:
                # input is Gray, but out is Color
                timg = skcolor.gray2rgb(timg)
        outShape = self.localCfg.getImageShape()
        tfType = self.localCfg.getTransformType()
        if tfType == TFTypes.squash:
            tret = ImageTransformer2D.hlpTransformSquashImage(timg, outShape[1:])
        elif tfType == TFTypes.crop:
            tret = ImageTransformer2D.hlpTransformCropImage(timg, outShape[1:])
        elif tfType == TFTypes.fill:
            tret = ImageTransformer2D.hlpTransformFillImage(timg, outShape[1:])
        elif tfType == TFTypes.cropFill:
            raise Exception('Image trasnformation [%s] not implemented yet!' % tfType)
        else:
            raise Exception('Unknown image transformation type [%s]' % tfType)
        if isReshapeFinal:
            if outCh == 1:
                tret = tret.reshape(outShape)
            else:
                tret = tret.transpose((2, 0, 1))
        if isAccumulateMean:
            if self.meanImage is None:
                self.meanImage = tret.astype(np.float)
            else:
                self.meanImage += tret.astype(np.float)
            self.counterMean += 1
        return tret


#################################################
def test_transformation():
    pathToJson1 = "../data/example_dataset_cfg_squash.json"
    pathToJson2 = "../data/example_dataset_cfg_crop.json"
    pathToJson3 = "../data/example_dataset_cfg_fill.json"
    cfgDB1 = DBImage2DConfig(pathToJson1)
    cfgDB2 = DBImage2DConfig(pathToJson2)
    cfgDB3 = DBImage2DConfig(pathToJson3)
    print (cfgDB1)
    pathImg1 = '../data/ecollins_450x300.jpg'
    # pathImg2='../data/ecollins_300x400.jpg'
    # pathImg1='../data/ecollins_450x300_gray.jpg'
    pathImg2 = '../data/ecollins_300x400_gray.jpg'
    timg1 = skio.imread(pathImg1)
    timg2 = skio.imread(pathImg2)
    imgTransformer1 = ImageTransformer2D(cfgDB1)
    imgTransformer2 = ImageTransformer2D(cfgDB2)
    imgTransformer3 = ImageTransformer2D(cfgDB3)
    timgw1_1 = imgTransformer1.processImageFromFile(pathImg1)
    timgw1_2 = imgTransformer2.processImageFromFile(pathImg1)
    timgw1_3 = imgTransformer3.processImageFromFile(pathImg1)
    timgw2_1 = imgTransformer1.processImageFromFile(pathImg2)
    timgw2_2 = imgTransformer2.processImageFromFile(pathImg2)
    timgw2_3 = imgTransformer3.processImageFromFile(pathImg2)
    print ('[%s] : %s ->%s, %s -> %s' % (pathToJson1, timg1.shape, timgw1_1.shape, timg2.shape, timgw2_1.shape))
    print ('[%s] : %s ->%s, %s -> %s' % (pathToJson2, timg1.shape, timgw1_2.shape, timg2.shape, timgw2_2.shape))
    print ('[%s] : %s ->%s, %s -> %s' % (pathToJson3, timg1.shape, timgw1_3.shape, timg2.shape, timgw2_3.shape))
    plt.figure()
    plt.subplot(2, 4, 1)
    plt.imshow(timg1, cmap=plt.gray())
    plt.subplot(2, 4, 2)
    plt.imshow(timgw1_1)
    plt.title('mode=%s, tf=%s' % (cfgDB1.getImageMode(), cfgDB1.getTransformType()))
    plt.subplot(2, 4, 3)
    plt.imshow(timgw1_2)
    plt.title('mode=%s, tf=%s' % (cfgDB2.getImageMode(), cfgDB2.getTransformType()))
    plt.subplot(2, 4, 4)
    plt.imshow(timgw1_3)
    plt.title('mode=%s, tf=%s' % (cfgDB3.getImageMode(), cfgDB3.getTransformType()))
    #
    plt.subplot(2, 4, 5)
    plt.imshow(timg2, cmap=plt.gray())
    plt.subplot(2, 4, 6)
    plt.imshow(timgw2_1)
    plt.title('mode=%s, tf=%s' % (cfgDB1.getImageMode(), cfgDB1.getTransformType()))
    plt.subplot(2, 4, 7)
    plt.imshow(timgw2_2)
    plt.title('mode=%s, tf=%s' % (cfgDB2.getImageMode(), cfgDB2.getTransformType()))
    plt.subplot(2, 4, 8)
    plt.imshow(timgw2_3)
    plt.title('mode=%s, tf=%s' % (cfgDB3.getImageMode(), cfgDB3.getTransformType()))
    plt.show()


def test_mean_image():
    from dbhelpers import DBImageImportReaderFromDir
    pathToJson = "../data/example_dataset_cfg_squash.json"
    cfgDB = DBImage2DConfig(pathToJson)
    imgReader = DBImageImportReaderFromDir(cfgDB)
    imgReader.precalculateInfo()
    print (imgReader.listLabels)
    plt.figure()
    for lli, ll in enumerate(imgReader.listLabels):
        imgTransformer = ImageTransformer2D(cfgDB)
        print ('%d -> %s' % (lli, ll))
        for pp in imgReader.listTrainPath[ll]:
            imgTransformer.processImageFromFile(pp, isAccumulateMean=True)
        plt.subplot(1, len(imgReader.listLabels), lli + 1)
        plt.imshow(imgTransformer.getMeanImage())
    plt.show()


#################################################
if __name__ == '__main__':
    # test_transformation()
    test_mean_image()
