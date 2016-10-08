#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__='ar'

import re
import sys
import os
import glob
import time
import json
import numpy as np
import skimage.io as io
import skimage.color as skcolor
import skimage.transform as sktransform
import matplotlib.pyplot as plt

from keras import backend as K

import keras
from keras.models import Sequential
from keras.layers import Dense, Dropout, Activation, Flatten, Convolution2D, InputLayer, \
                         AveragePooling2D, MaxPooling2D
# from keras.layers.core import Dense, Dropout, Activation, Flatten
from keras.optimizers import SGD
from keras.models import model_from_json
from keras.optimizers import Optimizer
from keras.optimizers import SGD, RMSprop, Adagrad, Adadelta, Adam, Adamax


from app.backend.core import utils as dlsutils
from batcher_image2d import BatcherImage2DLMDB
# from flow_parser import getKerasOptimizerName

from cfg import CFG_MODEL_TRAIN, CFG_SOLVER

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

#########################
def split_list_by_blocks(lst, psiz):
    """
    Split list by cuts fixed size psize (last cut can be less than psize),
    :param lst: input list
    :param psiz: size of cut
    :return: cutted-list
    """
    tret = [lst[x:x + psiz] for x in xrange(0, len(lst), psiz)]
    return tret

#########################
class KerasTrainer:
    extModelWeights = 'h5kerasmodel'
    extJsonTrainConfig = '_trainconfig.json'
    extJsonSolverState = '_solverstate.json'
    modelPrefix=''
    batcherLMDB = None
    pathModelConfig=None
    model=None
    outputDir=None
    sizeBatch=32
    numEpoch=1
    numIterPerEpoch=0
    intervalSaveModel=1
    intervalValidation=1
    currentIter=0
    currentEpoch=0
    printInterval=20
    def __init__(self):
        self.cleanResults()
    @staticmethod
    def adjustModelInputOutput2DBData(parModel, parLMDB, isFixOutputLayer = True):
        if isinstance(parLMDB, BatcherImage2DLMDB):
            ptrLMDB = parLMDB
        elif (isinstance(parLMDB, str) or isinstance(parLMDB, unicode)):
            ptrLMDB = BatcherImage2DLMDB(parLMDB, 1)
        else:
            raise Exception("Unknown parLMDB instance")
        #
        retModel = Sequential()
        tmpL0 = parModel.layers[0]
        if isinstance(tmpL0, InputLayer):
            idxStart=1
        else:
            idxStart=0
        retModel.add(InputLayer(input_shape=ptrLMDB.shapeImg))
        if isFixOutputLayer:
            listLayers = parModel.layers[idxStart:-1]
        else:
            listLayers = parModel.layers[idxStart:]
        for ll in listLayers:
            ll.inbound_nodes = []
            # print ('\tadd [%s]' % (ll.__str__()))
            if isinstance(ll, Convolution2D):
                retModel.add(Convolution2D.from_config(ll.get_config()))
            elif isinstance(ll, Dense):
                retModel.add(Dense.from_config(ll.get_config()))
            elif isinstance(ll, Flatten):
                retModel.add(Flatten.from_config(ll.get_config()))
            elif isinstance(ll, Activation):
                retModel.add(Activation.from_config(ll.get_config()))
            elif isinstance(ll, Dropout):
                retModel.add(Dropout.from_config(ll.get_config()))
            elif isinstance(ll, MaxPooling2D):
                retModel.add(MaxPooling2D.from_config(ll.get_config()))
            elif isinstance(ll, AveragePooling2D):
                retModel.add(AveragePooling2D.from_config(ll.get_config()))
        #
        # tmpL0 = parModel.layers[0]
        # tmpL0cfg = tmpL0.get_config()
        # if re.match(r'dense_input*', tmpL0.input.name) is not None:
        #     tmpShapeImageSize = np.prod(ptrLMDB.shapeImg)
        #     retModel = Sequential()
        #     retModel.add(
        #         Dense(tmpL0cfg['output_dim'], input_dim=tmpShapeImageSize, init=tmpL0cfg['init']))
        #     for ll in parModel.layers[1:]:
        #         retModel.add(ll)
        # elif re.match(r'convolution2d_input*', tmpL0.input.name) is not None:
        #     retModel = Sequential()
        #     retModel.add(
        #         Convolution2D(tmpL0cfg['nb_filter'], tmpL0cfg['nb_col'], tmpL0cfg['nb_row'],
        #                       border_mode=tmpL0cfg['border_mode'],
        #                       subsample=tmpL0cfg['subsample'],
        #                       input_shape=ptrLMDB.shapeImg,
        #                       init=tmpL0cfg['init']))
        #     for ll in parModel.layers[1:]:
        #         ll.inbound_nodes=[]
        #         print (ll)
        #         retModel.add(ll)
        # else:
        #     retModel = parModel
        # FIXME: check this point (automatic output layer size). SoftMax to config in feature
        if isFixOutputLayer:
            retModel.add(Dense(ptrLMDB.numLbl, activation='softmax'))
        return retModel
    def buildModel(self, pathLMDBJob, pathModelConfig,
                 sizeBatch, numEpoch, intervalSaveModel=1, intervalValidation=1,
                 outputDir=None, modelPrefixName='keras_model', isResizeInputLayerToImageShape=True):
        if self.isOk():
            self.cleanModel()
        self.loadBatcherLMDB(pathLMDBJob, sizeBatch)
        with open(pathModelConfig, 'r') as f:
            modelJSON = f.read()
            modelFromCfg = model_from_json(modelJSON)
            if modelFromCfg is not None:
                self.pathModelConfig = pathModelConfig
                self.sizeBatch = sizeBatch
                self.numEpoch = numEpoch
                self.numIterPerEpoch = self.batcherLMDB.numTrain / self.sizeBatch
                self.intervalSaveModel = intervalSaveModel
                self.intervalValidation = intervalValidation
                self.modelPrefix = modelPrefixName
                self.cleanResults()
                if outputDir is None:
                    self.outputDir = os.getcwd()
                else:
                    if os.path.isdir(outputDir):
                        self.outputDir = outputDir
                    else:
                        strErr = "Directory not found [%s]" % outputDir
                        self.printError(strErr)
                        raise Exception(strErr)
                # FIXME: check this point: need more accurate logic to sync Data-Shape and Model-Input-Shape
                # if isResizeInputLayerToImageShape:
                #     tmpL0 = modelFromCfg.layers[0]
                #     tmpL0cfg = tmpL0.get_config()
                #     if re.match(r'dense_input*', tmpL0.input.name) is not None:
                #         tmpShapeImageSize = np.prod(self.lmdbReader.shapeImg)
                #         self.model = Sequential()
                #         self.model.add(
                #             Dense(tmpL0cfg['output_dim'], input_dim=tmpShapeImageSize, init=tmpL0cfg['init']))
                #         for ll in modelFromCfg.layers[1:]:
                #             self.model.add(ll)
                #     else:
                #         self.model = modelFromCfg
                # else:
                #     self.model = modelFromCfg
                # FIXME: check this point (automatic output layer size). SoftMax to config in feature
                # self.model.add(Dense(self.lmdbReader.numLbl))
                # self.model.add(Activation('softmax'))
                self.model = KerasTrainer.adjustModelInputOutput2DBData(modelFromCfg, self.batcherLMDB)
                # TODO: make the setting for code below. For optimizer, loss-function, metrics
                sgd = SGD(lr=0.01, decay=1e-6, momentum=0.9, nesterov=True)
                self.model.compile(loss='categorical_crossentropy',
                                   optimizer=sgd,
                                   metrics=['accuracy'])
    def buildModelFromConfigs(self, paramBatcherLMDB, modelConfig,
                              sizeBatch, numEpoch,
                              modelOptimizer=None,
                              intervalSaveModel=1, intervalValidation=1,
                              outputDir=None, modelPrefixName='keras_model',
                              isAppendOutputLayer = True):
        self.batcherLMDB = paramBatcherLMDB
        modelFromCfg = modelConfig
        if modelFromCfg is not None:
            self.pathModelConfig = None
            self.sizeBatch = sizeBatch
            self.numEpoch = numEpoch
            self.numIterPerEpoch = self.batcherLMDB.numTrain / self.sizeBatch
            self.intervalSaveModel = intervalSaveModel
            self.intervalValidation = intervalValidation
            self.modelPrefix = modelPrefixName
            self.cleanResults()
            if outputDir is None:
                self.outputDir = os.getcwd()
            else:
                if os.path.isdir(outputDir):
                    self.outputDir = outputDir
                else:
                    strErr = "Directory not found [%s]" % outputDir
                    self.printError(strErr)
                    raise Exception(strErr)
            self.model = KerasTrainer.adjustModelInputOutput2DBData(modelFromCfg, self.batcherLMDB, isFixOutputLayer=isAppendOutputLayer)
            # TODO: make the setting for code below. For optimizer, loss-function, metrics
            if modelOptimizer is None:
                opt = SGD(lr=0.01, decay=1e-6, momentum=0.9, nesterov=True)
            else:
                opt = modelOptimizer
            self.model.compile(loss='categorical_crossentropy',
                               optimizer=opt,
                               metrics=['accuracy'])
    def isOk(self):
        return ((self.batcherLMDB is not None) and (self.model is not None))
    def loadBatcherLMDB(self, dbJobID, sizeBatch):
        dirDataset=dlsutils.getPathForDatasetDir()
        pathLMDBJob = os.path.join(dirDataset, dbJobID)
        self.batcherLMDB = BatcherImage2DLMDB(pathLMDBJob, sizeBatch)
        self.sizeBatch = sizeBatch
        if not self.batcherLMDB.isOk():
            strErr = "[KERAS-TRAINER] Incorrect LMDB-data in [%s]" % dbJobID
            self.printError(strErr)
            raise Exception(strErr)
    def cleanResults(self):
        self.trainLog={'epoch':[], 'iter':[], 'lossTrain':[], 'accTrain':[], 'lossVal':[], 'accVal':[]}
        self.currentIter=0
        self.currentEpoch=0
    def cleanModel(self):
        if self.isOk():
            self.cleanResults()
            self.model = None
            self.batcherLMDB.close()
            self.batcherLMDB = None
            self.pathModelConfig = None
    def printError(self, strError):
        print("keras-error#%s" % strError)
    def trainOneIter(self):
        modelInputShape = list(self.model.input_shape)
        dataX, dataY = self.batcherLMDB.getBatchTrain(reshape2Shape=modelInputShape)
        tlossTrain = self.model.train_on_batch(dataX, dataY)
        isNeedPrintInfo = False
        if (self.currentIter % self.printInterval == 0):
            dataXval, dataYval = self.batcherLMDB.getBatchVal(reshape2Shape=modelInputShape)
            tlossVal = self.model.test_on_batch(dataXval, dataYval)
            self.trainLog['epoch'].append(self.currentEpoch)
            self.trainLog['iter'].append(self.currentIter)
            self.trainLog['lossTrain'].append(float(tlossTrain[0]))
            self.trainLog['accTrain'].append(float(tlossTrain[1]))
            self.trainLog['lossVal'].append(float(tlossVal[0]))
            self.trainLog['accVal'].append(float(tlossVal[1]))
            print(("keras-info#%s#%s#%d|%d|%0.5f|%0.5f|%0.5f|%0.5f") % (
                'I',
                time.strftime('%Y.%m.%d-%H:%M:%S'),
                self.currentEpoch,
                self.currentIter,
                self.trainLog['lossTrain'][-1],
                self.trainLog['accTrain'][-1],
                self.trainLog['lossVal'][-1],
                self.trainLog['accVal'][-1]
            ))
            sys.stdout.flush()
            isNeedPrintInfo = True
        self.currentIter += 1
        return isNeedPrintInfo
    def trainOneEpoch(self):
        if not self.isOk():
            strErr='KerasTrainer is not correctly initialized'
            self.printError(strErr)
            raise Exception(strErr)
        modelInputShape = list(self.model.input_shape)
        for ii in xrange(self.numIterPerEpoch):
            dataX, dataY = self.batcherLMDB.getBatchTrain(reshape2Shape=modelInputShape)
            tlossTrain = self.model.train_on_batch(dataX, dataY)
            if (self.currentIter%self.printInterval==0):
                dataXval, dataYval = self.batcherLMDB.getBatchVal(reshape2Shape=modelInputShape)
                tlossVal = self.model.test_on_batch(dataXval, dataYval)
                self.trainLog['epoch'].append(self.currentEpoch)
                self.trainLog['iter'].append(self.currentIter)
                self.trainLog['lossTrain'].append(tlossTrain[0])
                self.trainLog['accTrain'].append(tlossTrain[1])
                self.trainLog['lossVal'].append(tlossVal[0])
                self.trainLog['accVal'].append(tlossVal[1])
                print(("keras-info#%s#%s#%d|%d|%0.5f|%0.5f|%0.5f|%0.5f") % (
                    'I',
                    time.strftime('%Y.%m.%d-%H:%M:%S'),
                    self.currentEpoch,
                    self.currentIter,
                    self.trainLog['lossTrain'][-1],
                    self.trainLog['accTrain'][-1],
                    self.trainLog['lossVal'][-1],
                    self.trainLog['accVal'][-1]
                ))
                sys.stdout.flush()
            self.currentIter +=1
        self.currentEpoch += 1
    def convertImgUint8ToDBImage(self, pimg):
        #FIXME: shape we can get from Batcher and from model.layers...
        if len(self.batcherLMDB.shapeImg) < 3:
            numCh = 1
        else:
            # FIXME: check this point, number of channels can be on last element on array...
            numCh = self.batcherLMDB.shapeImg[0]
        # check #channels of input image
        if len(pimg.shape) < 3:
            numChImg = 1
        else:
            numChImg = 3
        # if #channels of input image is not equal to #channels in TrainDatabse, then convert shape inp Image to Database-Shape
        if numCh != numChImg:
            if numCh == 1:
                # FIXME: this is fix potential bug: rgb2gray change automaticaly min/max range from (0,255) to (0,1), headbang!
                pimg = skcolor.rgb2gray(pimg.astype(np.float))
            else:
                pimg = skcolor.gray2rgb(pimg)
        timg = sktransform.resize(pimg.astype(np.float32) * self.batcherLMDB.scaleFactor, self.batcherLMDB.shapeImg[1:])
        if numCh==1:
            timg = timg.reshape([1] + list(timg.shape))
        else:
            timg = timg.transpose((2, 0, 1))
        if self.batcherLMDB.isRemoveMean:
            # FIXME: check this point: type of the mean-removing from one cofig (for train and inference stages)
            timg -= self.batcherLMDB.meanChImage
        return timg
    def inferListImagePath(self, listPathToImages, batchSizeInfer=None):
        if not self.isOk():
            strError = 'KerasTrainer class is not initialized to call inference()'
            self.printError(strError)
            raise Exception(strError)
        if batchSizeInfer is None:
            batchSizeInfer = self.sizeBatch
        splListPathToImages = split_list_by_blocks(listPathToImages, batchSizeInfer)
        retProb = None
        for idxBatch,lstPath in enumerate(splListPathToImages):
            modelInputShape = list(self.model.input_shape)
            # Fit batchSize to current number of images in list (lstPath)
            tmpBatchSize = len(lstPath)
            tdataX=None
            for ppi,ppath in enumerate(lstPath):
                timg = io.imread(ppath)
                if timg is None:
                    strError = 'Cant read input image [%s], may be image is incorrect' % ppath
                    self.printError(strError)
                    raise Exception(strError)
                timg = self.convertImgUint8ToDBImage(timg)
                # Delayed initialization of Batch of Input-Data
                if tdataX is None:
                    tsizeX = [tmpBatchSize, timg.shape[0], timg.shape[1], timg.shape[2]]
                    tdataX = np.zeros(tsizeX, np.float32)
                tdataX[ppi] = timg
            #FIXME: chack this point, this code tested on Fully-Connected NN, need tests for Convolution Neurel Networks
            tdataX = tdataX.reshape([tmpBatchSize] + modelInputShape[1:])
            # tprob = self.model.predict(tdataX, batch_size=tmpBatchSize)
            tprob = self.model.predict(tdataX)
            # Delayed initialization of returned classification probability
            if retProb is None:
                retProb = tprob
            else:
                retProb = np.concatenate(retProb, tprob)
        idxMax = np.argmax(retProb, axis=1)
        retLbl = np.array(self.batcherLMDB.lbl)[idxMax]
        retVal = np.max(retProb, axis=1)
        ret = {
            'prob'  : retProb,
            'label' : retLbl,
            'val'   : retVal
        }
        return ret
    def inferOneImageU8_DebugActivations(self, imgu8):
        # [BEGIN] this code is cloned from self.inferOneImageU8()
        timg = self.convertImgUint8ToDBImage(imgu8)
        tmpBatchSize = 1
        tsizeX = [tmpBatchSize, timg.shape[0], timg.shape[1], timg.shape[2]]
        # FIXME: [1] check data type! [float32/float64]
        tdataX = np.zeros(tsizeX, np.float32)
        tdataX[0] = timg
        modelInputShape = list(self.model.input_shape)
        tdataX = tdataX.reshape([tmpBatchSize] + modelInputShape[1:])
        # [END] this code is cloned from self.inferOneImageU8()
        lstLayerForK=[]
        for ii in xrange(len(self.model.layers)):
            lstLayerForK.append(self.model.layers[ii].output)
        localGetActivations = K.function([self.model.layers[0].input], lstLayerForK)
        dataActivations = localGetActivations([tdataX])
        return dataActivations
    def inferOneImageU8(self, imgu8):
        timg = self.convertImgUint8ToDBImage(imgu8)
        tmpBatchSize = 1
        tsizeX = [tmpBatchSize, timg.shape[0], timg.shape[1], timg.shape[2]]
        # FIXME: [1] check data type! [float32/float64]
        tdataX = np.zeros(tsizeX, np.float32)
        tdataX[0] = timg
        modelInputShape = list(self.model.input_shape)
        tdataX = tdataX.reshape([tmpBatchSize] + modelInputShape[1:])
        tprob = self.model.predict(tdataX, batch_size=1)
        posMax = np.argmax(tprob[0])
        tlbl = self.batcherLMDB.lbl[posMax]
        tval = tprob[0][posMax]
        tret = {
            'prob': tprob,
            'label': tlbl,
            'val': tval
        }
        return tret
    def inferOneImagePath(self, pathToImage):
        if not self.isOk():
            strError = 'KerasTrainer class is not initialized to call inference()'
            self.printError(strError)
            raise Exception(strError)
        if not os.path.isfile(pathToImage):
            strError='Cant find input image [%s]' % pathToImage
            self.printError(strError)
            raise Exception(strError)
        timgu8 = io.imread(pathToImage)
        if timgu8 is None:
            strError = 'Cant read input image [%s], may be image is incorrect' % pathToImage
            self.printError(strError)
            raise Exception(strError)
        return self.inferOneImageU8(timgu8)
    def inferOneImagePathSorted(self, pathToImage):
        tret = self.inferOneImagePath(pathToImage)
        tarrProb=tret['prob'][0]
        sortedIdx = np.argsort(-tarrProb)
        sortedLbl  = np.array(self.batcherLMDB.lbl)[sortedIdx]
        sortedProb = tarrProb[sortedIdx]
        tmp = [(ll,pp) for ll,pp in zip(sortedLbl,sortedProb)]
        ret = {
            'best': {
                'label':    tret['label'],
                'prob':     tret['val']
            },
            'distrib': tmp
        }
        return ret
    def saveModelState(self, parOutputDir=None, isSaveWeights=True):
        if parOutputDir is not None:
            if not os.path.isdir(parOutputDir):
                strError = "Cant find directory [%s]" % parOutputDir
                self.printError(strError)
                raise Exception(strError)
            self.outputDir = parOutputDir
        foutModelCfg=os.path.join(self.outputDir,"%s%s" % (self.modelPrefix, self.extJsonTrainConfig))
        foutSolverCfg=os.path.join(self.outputDir,"%s%s" % (self.modelPrefix, self.extJsonSolverState))
        foutModelWeights=os.path.join(self.outputDir,'%s_iter_%06d.%s' % (self.modelPrefix,self.currentIter,self.extModelWeights))
        #
        #FIXME: this is temporary solution, fix this in the future!
        tmpOptimizerCfg = self.model.optimizer.get_config()
        tmpOptimizerCfg['name'] = getKerasOptimizerName(self.model.optimizer)
        jsonSolverState={
            'optimizer'         : tmpOptimizerCfg,
            'loss'              : self.model.loss,
            'metrics'           : self.model.metrics_names,
            'dataset-id'        : self.batcherLMDB.cfg.dbId,
            'pathModelConfig'   : "%s" % os.path.basename(self.pathModelConfig),
            'sizeBatch'         : self.sizeBatch,
            'numEpoch'          : self.numEpoch,
            'currentIter'       : self.currentIter,
            'intervalSaveModel' : self.intervalSaveModel,
            'intervalValidation': self.intervalValidation,
            'printInterval'     : self.printInterval,
            'modelPrefix'       : "%s" % self.modelPrefix
        }
        # FIXME: check the necesserity of the item [pathModelConfig]
        txtJsonSolverState = json.dumps(jsonSolverState, indent=4)
        with open(foutSolverCfg, 'w') as fslv:
            fslv.write(txtJsonSolverState)
        #
        with open(foutModelCfg, 'w') as fcfg:
            fcfg.write(self.model.to_json(sort_keys=True, indent=4, separators=(',', ': ')))
        if isSaveWeights:
            self.model.save_weights(foutModelWeights, overwrite=True)
        # Print message when model saved (for Digits)
        print(("keras-savestate#%s#%s#%s|%s|%s") % (
            'I',
            time.strftime('%Y.%m.%d-%H:%M:%S'),
            os.path.abspath(foutModelCfg),
            os.path.abspath(foutSolverCfg),
            os.path.abspath(foutModelWeights)
        ))
    def getTrainingStatesInDir(self, pathTrainDir, isReturnAllWeightsPath=False):
        """
        explore directory with training-output data, and return path to files
        :param pathTrainDir: path to directory with training-output
        :return: None or list [pathModelConfigJson, pathSolverStateJson, pathModelWeights]
        """
        if not os.path.isdir(pathTrainDir):
            strError = "Cant find directory [%s]" % pathTrainDir
            self.printError(strError)
            return None
        lstModelConfig  = glob.glob('%s/*%s' % (pathTrainDir, self.extJsonTrainConfig))
        lstSolverStates = glob.glob('%s/*%s' % (pathTrainDir, self.extJsonSolverState))
        lstModelWeights = glob.glob('%s/*_iter_[0-9]*.%s' % (pathTrainDir, self.extModelWeights))
        if len(lstModelConfig)<1:
            strError = 'Cant find ModelConfig [%s] files in directory [%s]' % (self.extJsonTrainConfig, pathTrainDir)
            self.printError(strError)
            return None
        if len(lstSolverStates)<1:
            strError = 'Cant find Solver-States [%s] files in directory [%s]' % (self.extJsonSolverState, pathTrainDir)
            self.printError(strError)
            return None
        if len(lstModelWeights) < 1:
            strError = 'Cant find Model-Weights [%s] files in directory [%s]' % (self.extModelWeights, pathTrainDir)
            self.printError(strError)
            return None
        lstModelConfig  = sorted(lstModelConfig)
        lstSolverStates = sorted(lstSolverStates)
        lstModelWeights = sorted(lstModelWeights)
        pathModelConfig = lstModelConfig[-1]
        pathSolverState = lstSolverStates[-1]
        if not isReturnAllWeightsPath:
            pathModelWeight = lstModelWeights[-1]
        else:
            pathModelWeight = lstModelWeights
        return [pathModelConfig, pathSolverState, pathModelWeight]
    def loadModelFromTrainingStateInDir(self, pathTrainDir, isLoadLMDBReader=True):
        self.cleanModel()
        stateConfigs = self.getTrainingStatesInDir(pathTrainDir)
        if stateConfigs is None:
            strError = 'Cant find Model saved state from directory [%s]' % pathTrainDir
            self.printError(strError)
        pathModelConfig = stateConfigs[0]
        pathSolverState = stateConfigs[1]
        pathModelWeight = stateConfigs[2]
        self.loadModelFromTrainingState(pathModelConfig=pathModelConfig,
                                        pathSolverState=pathSolverState,
                                        pathModelWeight=pathModelWeight,
                                        isLoadLMDBReader=isLoadLMDBReader)
    def loadModelFromTaskModelDir(self, pathTaskDir):
        pathConfigModel  = os.path.join(pathTaskDir, CFG_MODEL_TRAIN)
        pathConfigSolver = os.path.join(pathTaskDir, CFG_SOLVER)
        self.loadModelFromTrainingState(pathModelConfig=pathConfigModel,
                                        pathSolverState=pathConfigSolver)
        self.outputDir = pathTaskDir
    def loadModelFromTrainingState(self, pathModelConfig, pathSolverState,
                                   pathModelWeight=None, pathLMDBDataset=None, isLoadLMDBReader=True):
        """
        Load Keras Model from Trained state (if present path to model Weights), or
         for initial config
        :param pathModelConfig: path to Model Config in JSON format
        :param pathSolverState: path to SolverState Config in JSON format
        :param pathModelWeight: path to Model Weights as binary Keras dump
        :param pathModelWeight: path to LMDB-Dataset, if None -> skip
        :param isLoadLMDBReader: load or not LMDBReader from SolverState Config
        :return: None
        """
        self.cleanModel()
        # (1) Load Model Config from Json:
        with open(pathModelConfig, 'r') as fModelConfig:
            tmpStr = fModelConfig.read()
            self.model = keras.models.model_from_json(tmpStr)
        if self.model is None:
            strError = 'Invalid Model config in file [%s]' % pathModelConfig
            self.printError(strError)
            raise Exception(strError)
        # (2) Load SoverState Config from Json:
        with open(pathSolverState) as fSolverState:
            tmpStr = fSolverState.read()
            configSolverState = json.loads(tmpStr)
        if configSolverState is None:
            strError = 'Invalid SolverState config in file [%s]' % pathSolverState
            self.printError(strError)
            raise Exception(strError)
        if pathLMDBDataset is not None:
            configSolverState['dataset-id'] = pathLMDBDataset
        # (3) Load Model Weights:
        if pathModelWeight is not None:
            self.model.load_weights(pathModelWeight)
        # (4) Reconfigure Model State:
        self.intervalSaveModel  = configSolverState['intervalSaveModel']
        self.intervalValidation = configSolverState['intervalValidation']
        self.numEpoch           = configSolverState['numEpoch']
        self.currentIter        = configSolverState['currentIter']
        self.sizeBatch          = configSolverState['sizeBatch']
        self.modelPrefix        = configSolverState['modelPrefix']
        if isLoadLMDBReader:
            self.loadBatcherLMDB(configSolverState['dataset-id'], self.sizeBatch)
            self.numIterPerEpoch    = self.batcherLMDB.numTrain / self.sizeBatch
            self.currentEpoch       = np.floor(self.currentIter / self.numIterPerEpoch)
        else:
            self.numIterPerEpoch    = 1
            self.currentEpoch       = 0
        self.pathModelConfig    = pathModelConfig
        # (5) Configure Loss, Solver, Metrics and compile model
        tmpCfgOptimizer = configSolverState['optimizer'].copy()
        parOptimizer    = keras.optimizers.get(tmpCfgOptimizer)
        parLoss         = configSolverState['loss']
        # parMetrics      = configSolverState['metrics']
        #TODO: i think this is a bug or a bad realization in Keras: 'loss' is an unknown metrics, this is temporary fix
        parMetrics = []
        if 'acc' in configSolverState['metrics']:
            parMetrics.append('accuracy')
        self.model.compile(optimizer=parOptimizer, loss=parLoss, metrics=parMetrics)
    def runTrain(self, paramNumEpoch=-1):
        if not self.isOk():
            strErr = 'KerasTrainer is not correctly initialized'
            self.printError(strErr)
            raise Exception(strErr)
        if paramNumEpoch>0:
            self.numEpoch = paramNumEpoch
        for ei in xrange(self.numEpoch):
            self.trainOneEpoch()
            if (ei%self.intervalSaveModel)==0:
                self.saveModelState()
            if (ei%self.intervalValidation)==0:
                pass

#########################
if __name__ == '__main__':
    pass