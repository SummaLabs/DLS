#!/usr/bin/python

import os
import sys
import json
import tempfile
import numpy as np

try:
    from cStringIO import StringIO
except:
    from StringIO import StringIO

from skimage import io as skio
from keras.models import Sequential
from keras.layers import Convolution2D, Dense, \
    MaxPooling2D, AveragePooling2D, Activation, Flatten
from keras.optimizers import SGD, RMSprop, Adagrad, Adadelta, Adam, Adamax

from keras.utils.visualize_util import plot as kplot
import keras.utils.visualize_util as kervis

from compiler.ast import flatten

from keras_trainer_v3 import KerasTrainer
from batcher_image2d import BatcherImage2DLMDB
from cfg import CFG_MODEL_TRAIN, CFG_SOLVER, PREFIX_SNAPSHOT

####################################
class NodeF:
    inpNode = None
    outNode = None
    jsonCfg = None
    def __init__(self, jsonNode, inpNode=None, outNode=None):
        self.jsonCfg    = jsonNode
        self.jsonParams = jsonNode['params']
        self.inpNode    = inpNode
        self.outNode    = outNode
    def toString(self):
        strInp = 'NULL'
        if self.inpNode is not None:
            strInp = '%s(%s)' % (self.inpNode[0].jsonCfg['id'],self.inpNode[0].jsonCfg['layerType'])
        strOut = 'NULL'
        if self.outNode is not None:
            strOut = '%s(%s)' % (self.outNode[0].jsonCfg['id'], self.outNode[0].jsonCfg['layerType'])
        strCfg = 'NULL'
        if self.jsonCfg is not None:
            strCfg = '%s(%s)' % (self.jsonCfg['id'], self.jsonCfg['layerType'])
        ret = '{obj->[%s],  in:%s, out:%s}' % (strCfg, strInp, strOut)
        return ret
    def validateFields(self):
        if self.jsonCfg is not None:
            strType = self.jsonCfg['layerType']
            if not strType in dictRequiredFields.keys():
                raise Exception('Unknown node type [%s]' % strType)
            tmpParamNames=self.jsonParams.keys()
            for ii in dictRequiredFields[strType]:
                if not ii in tmpParamNames:
                    raise Exception('Required field in Node not found: nodeFieled=[%s], NodeType=[%s], NodeId=[%s]' % (ii, strType, self.jsonCfg['id']))
    def __str__(self):
        return self.toString()
    def __repr__(self):
        return self.toString()

####################################
dictNonlinFunJson2Keras = {
    'Sigmoid': 'sigmoid',
    'Tanh': 'tanh',
    'ReLU': 'relu',
    'SoftMax': 'softmax'
}

# values: (is Available, is Correct but currently not available)
dictAvailableConnectionsFromTo = {
    'data' : {
        'data'          : (False, None),
        'convolution'   : (True,  None),
        'dense'         : (True,  None),
        'solver'        : (False, None)
    },
    'convolution' : {
        'data'          : (False, None),
        'convolution'   : (True,  None),
        'dense'         : (True,  None),
        'solver'        : (False, None)
    },
    'dense' : {
        'data'          : (False, None),
        'convolution'   : (False, None),
        'dense'         : (True,  None),
        'solver'        : (True,  None)
    },
    'solver' : {
        'data'          : (False, None),
        'convolution'   : (False, None),
        'dense'         : (False, None),
        'solver'        : (False, None)
    }
}

dictRequiredFields = {
    'data'          : ['datasetType', 'datasetId'],
    'convolution'   : ['filtersCount', 'filterWidth', 'filterHeight', 'subsamplingSize', 'activationFunction', 'subsamplingType', 'isTrainable'],
    'dense'         : ['neuronsCount', 'activationFunction', 'isTrainable'],
    'solver'        : ['epochsCount', 'snapshotInterval', 'validationInterval', 'batchSize', 'learningRate', 'optimizer']
}

####################################
def checkPreviousConnection(pNode):
    pNodeType = pNode.jsonCfg['layerType']
    if pNode.inpNode is not None:
        inpNodeType = pNode.inpNode[0].jsonCfg['layerType']
        if (pNodeType in dictAvailableConnectionsFromTo.keys()) and (inpNodeType in dictAvailableConnectionsFromTo.keys()):
            return dictAvailableConnectionsFromTo[pNodeType][inpNodeType]
        else:
            raise NotImplementedError('Incorrect or unsupproted connection (%s -> %s)' % (inpNodeType, pNodeType))
    return True

def nonlinFunJson2Keras(strJson):
    if strJson in dictNonlinFunJson2Keras.keys():
        return dictNonlinFunJson2Keras[strJson]
    return 'relu'

def getSubsamplingJs2Keras(strSubsamplingJs, subSize = (2,2)):
    if strSubsamplingJs == 'max_pooling':
        return MaxPooling2D(subSize)
    elif strSubsamplingJs == 'average_pooling':
        return AveragePooling2D(subSize)
    else:
        raise NotImplemented('Unknown type if subsampling layer [%s]' % strSubsamplingJs)

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

####################################
class DLSDesignerFlowsParser:
    configFlowRaw   = None
    configFlow      = None
    supportedNodes  = dictRequiredFields.keys()
    reqiredNodes    = ['data', 'solver']
    def __init__(self, jsonFlow):
        if isinstance(jsonFlow, basestring):
            with open(jsonFlow, 'r') as f:
                self.configFlowRaw = json.load(f)
        elif isinstance(jsonFlow, dict):
            self.configFlowRaw = jsonFlow
        else:
            raise Exception('Unknown type for Model flow [%s]' % type(jsonFlow))
    def clear(self):
        self.configFlow     = None
        self.configFlowRaw  = None
    def isOk(self):
        return (self.configFlowRaw is not None)
    def checkIsOk(self):
        if not self.isOk():
            raise Exception('class FlowsParsser is not properly configured')
    def countNodeType(self, cfg, strType):
        cnt = 0
        for ii in cfg:
            if ii['type'] == strType:
                cnt+=1
    def findNodeById(self, cfg, strId):
        #FIXME: we requre, than each element have unique ID
        for ii in cfg:
            if ii['id'] == strId:
                return ii
    def removeNodeFromWires(self, cfg, elem):
        tmpId=elem['id']
        for ii in cfg:
            if 'wires' in ii.keys():
                if tmpId in ii['wires']:
                    ii['wires'].remove(tmpId)
    def checkNumberOfWires(self, cfg):
        for ii in cfg:
            if 'wires' in ii.keys():
                # numWires = max([0]+[len(x) for x in ii['wires']])
                numWires = max([0] + [len(ii['wires'])])
                if numWires>1:
                    raise NotImplementedError('Converter currently not supported multiple connections [%s]' % ii)
    #FIXME: this code very inefficinet, but as ia think more understandable...
    def findLinkedNodes(self, lstNodes, pNode):
        # (1) find output-connections
        if 'wires' in pNode.jsonCfg.keys():
            tlstId = flatten(pNode.jsonCfg['wires'])
            if len(tlstId)>0:
                for ii in lstNodes:
                    #FIXME: check this code for many connections
                    if ii.jsonCfg['id'] in tlstId:
                        if pNode.outNode is None:
                            pNode.outNode = []
                        pNode.outNode.append(ii)
        # (2) find input-connections
        pNodeId=pNode.jsonCfg['id']
        for ii in lstNodes:
            if 'wires' in ii.jsonCfg.keys():
                tlstId = flatten(ii.jsonCfg['wires'])
                if pNodeId in tlstId:
                    if pNode.inpNode is None:
                        pNode.inpNode = []
                    pNode.inpNode.append(ii)

    def getConnectedList(self, cfg, isCheckConnections=True):
        # (1) generate non-linked list of Nodes
        lstNodes=[]
        for ii in cfg:
            tmpNode = NodeF(ii)
            lstNodes.append(tmpNode)
        # (2) link nodes
        for ii in lstNodes:
            self.findLinkedNodes(lstNodes, ii)
        # (3) find input nodes: in sequential model there is only one Input Node
        tmpInputNodes=[]
        for ii in lstNodes:
            if ii.inpNode is None:
                tmpInputNodes.append(ii)
        if len(tmpInputNodes)>1:
            raise NotImplementedError('Flow have more than one input nodes (currently not implemented) or not linked [%s]' % tmpInputNodes)
        if len(tmpInputNodes)<1:
            raise Exception('Unknown graph connection')
        lstFlowNodes=[]
        firstNode = tmpInputNodes[0]
        lstFlowNodes.append(firstNode)
        maxCnt=100
        cnt=0
        tmpNode = firstNode
        while cnt<maxCnt:
            if tmpNode.outNode is not None:
                tmpNode = tmpNode.outNode[0] #FIXME: work only for sequential models
                lstFlowNodes.append(tmpNode)
            else:
                break
            cnt+=1
        if isCheckConnections:
            # (1) Validate node-fields
            for nn in lstFlowNodes:
                nn.validateFields()
            # (2) Validate between-nodes connections
            for idx,nn in enumerate(lstFlowNodes):
                if not checkPreviousConnection(nn):
                    raise Exception('Inkorrect node connection %d : [%s] -> [%s]' % (idx, nn.inpNode[0], nn))
            # (3) Check required nodes:
            lstNodeType = [ii.jsonCfg['layerType'] for ii in lstFlowNodes]
            for ii in self.reqiredNodes:
                if not ii in lstNodeType:
                    raise Exception('In Neural Flow missing required node [%s]' % ii)
        return lstFlowNodes
    def getConnectedFlow(self, isCheckConnections=True):
        return self.getConnectedList(self.configFlow, isCheckConnections)
    def buildKerasTrainer(self, pathJobDir = None, isAppendOutputLayer = True, isPrecalculateLayersDict=False):
        self.cleanAndValidate()
        sortedFlow = self.getConnectedFlow()
        model=Sequential()
        isFirstComputationLayer = True
        # Step 1: Search data-layers:
        datasetType         = 'image2d'
        datasetId           = 'unknown-id'
        paramNumEpochs      = -1
        paramIntSnapshot    = -1
        paramIntValidation  = -1
        batchSize           = -1
        paramLearningRate   = -1
        paramOptimizerStr   = 'unknowm-optimizer'
        paramLossFunction   = 'unknown-loss'
        paramOptimizer      = None
        for idx, node in enumerate(sortedFlow):
            tcfg = node.jsonParams
            ttype = node.jsonCfg['layerType']
            if ttype == 'data':
                datasetType = tcfg['datasetType']
                datasetId   = tcfg['datasetId']
            elif ttype == 'solver':
                paramNumEpochs = int(tcfg['epochsCount'])
                paramIntSnapshot = int(tcfg['snapshotInterval'])
                paramIntValidation = int(tcfg['validationInterval'])
                batchSize = int(tcfg['batchSize'])
                paramLearningRate = float(tcfg['learningRate'])
                paramOptimizerStr = tcfg['optimizer']
                paramOptimizer = getOptimizerJson2Keras(paramOptimizerStr, parLR=paramLearningRate)
                paramLossFunction = tcfg['lossFunction']
        #
        cfgJsonOptimizer = {
            'name':         paramOptimizerStr,
            'lr':           paramLearningRate,
            'nesterov':     True,
            'momentum':     0.9,
            'decay':        1.0e-6
        }
        cfgJsonSolver = {
            'optimizer':            cfgJsonOptimizer,
            'loss':                 paramLossFunction,
            'metrics':              ['loss', 'acc'],
            'dataset-id':           datasetId,
            'pathModelConfig':      CFG_MODEL_TRAIN,
            'sizeBatch':            batchSize,
            'numEpoch':             paramNumEpochs,
            'currentIter':          0, #FIXME: check this point, initialize variable from previous Solver-state
            'intervalSaveModel':    paramIntSnapshot,
            'intervalValidation':   paramIntValidation,
            'printInterval':        paramIntValidation,
            'modelPrefix':          PREFIX_SNAPSHOT
        }
        #
        if pathJobDir is not None:
            pathLMDB = os.path.join(pathJobDir, datasetId)
            batcherLMDB = BatcherImage2DLMDB(pathLMDB)
            if not batcherLMDB.isOk():
                raise Exception('Cant load LMDB Dataset from path [%s]' % pathLMDB)
        # Step 2: search Neural Layers:
        dictLayers={}
        for idx, node in enumerate(sortedFlow):
            #TODO: append code after night talk
            # print ('[%d/%d] node-type: [%s]' % (idx, len(sortedFlow), node.jsonCfg['layerType']))
            tcfg=node.jsonParams
            ttype=node.jsonCfg['layerType']
            if ttype == 'convolution':
                #FIXME: parameter-names may change
                numberFilters   = int(tcfg['filtersCount']) if tcfg['filtersCount'] else 1
                # paramStride     = int(tcfg['stride']) if tcfg['stride'] else 1
                # paramStride     = (paramStride, paramStride)
                paramStride     = (1,1)
                filterSizeX     = int(tcfg['filterWidth']) if tcfg['filterHeight'] else 1
                filterSizeY     = int(tcfg['filterWidth']) if tcfg['filterWidth'] else 1
                strSubsampType  = tcfg['subsamplingType'] if tcfg['subsamplingType'] else 'max_pooling'
                #FIXME: currently not used...
                strNonLinFunc   = tcfg['activationFunction']
                isTrainable     = tcfg['isTrainable'] if tcfg['isTrainable'] else True
                # FIXME: check this point: separate X/Y subsampling selection currently not implemented in WEB-UI !!!
                tmpSubsamplingSize = int(tcfg['subsamplingSize']) if tcfg['subsamplingSize'] else 2
                sizeSubsampling = (tmpSubsamplingSize,tmpSubsamplingSize)
                # FIXME: parameter selection currently not implemented in WEB-UI !!!
                strBorderMode   = 'same'
                #
                # FIXME: check this point, this parameter only for model validation, real shape must be calculated from input 2D(3D) image size
                if pathJobDir is None:
                    paramInputShape = (3,128,128)
                else:
                    paramInputShape = batcherLMDB.shapeImg
                if isFirstComputationLayer:
                    tmpLayer = Convolution2D(numberFilters, filterSizeX, filterSizeY,
                                             border_mode=strBorderMode,
                                             subsample=paramStride,
                                             input_shape=paramInputShape,
                                             activation=nonlinFunJson2Keras(strNonLinFunc))
                    isFirstComputationLayer = False
                else:
                    tmpLayer = Convolution2D(numberFilters, filterSizeX, filterSizeY,
                                             subsample=paramStride,
                                             border_mode=strBorderMode,
                                             activation=nonlinFunJson2Keras(strNonLinFunc))
                tmpLayer.trainable=isTrainable
                model.add(tmpLayer)
                # model.add(Activation())
                model.add(getSubsamplingJs2Keras(strSubsampType, sizeSubsampling))
                if isPrecalculateLayersDict:
                    dictLayers[node.jsonCfg['id']] = model.layers[-1]
            elif ttype == 'dense':
                #FIXME: this parameter value only for valid Kearas model building, on step, when model prepared for calc this parameter resolved from data input
                if pathJobDir is None:
                    paramInputDim = 784
                else:
                    paramInputDim = np.prod(batcherLMDB.shapeImg)
                strNonLinFunc = tcfg['activationFunction']
                numberNeurons = int(tcfg['neuronsCount']) if tcfg['neuronsCount'] else 1
                isTrainable   = tcfg['isTrainable'] if tcfg['isTrainable'] else True
                if isFirstComputationLayer:
                    tmpLayer = Dense(numberNeurons,
                                     input_dim=paramInputDim,
                                     activation=nonlinFunJson2Keras(strNonLinFunc))
                    isFirstComputationLayer = False
                else:
                    tmpLayer = Dense(numberNeurons,
                                     activation=nonlinFunJson2Keras(strNonLinFunc))
                if node.inpNode is not None:
                    if node.inpNode[0].jsonCfg['layerType'] == 'convolution':
                        model.add(Flatten())
                tmpLayer.trainable=isTrainable
                model.add(tmpLayer)
                # model.add(Activation(nonlinFunJson2Keras(strNonLinFunc)))
                if isPrecalculateLayersDict:
                    dictLayers[node.jsonCfg['id']] = model.layers[-1]
        # (1) Prepare dataset:
        if pathJobDir is None:
            pathLMDB = datasetId
            batcherLMDB = None
            kerasTrainer = KerasTrainer()
            kerasTrainer.model = model
        else:
            kerasTrainer = KerasTrainer()
            kerasTrainer.buildModelFromConfigs(batcherLMDB, model,
                                               sizeBatch=batchSize,
                                               numEpoch=paramNumEpochs,
                                               modelOptimizer=paramOptimizer,
                                               intervalSaveModel=paramIntSnapshot,
                                               intervalValidation=paramIntValidation,
                                               isAppendOutputLayer=isAppendOutputLayer)
        if not isPrecalculateLayersDict:
            return (kerasTrainer, cfgJsonSolver)
        else:
            return (kerasTrainer, cfgJsonSolver, dictLayers)
    def buildKerasModelInJson(self, pathJobDir = None):
        kerasTrainer,_ = self.buildKerasTrainer()
        return json.loads(kerasTrainer.model.to_json(sort_keys=True, indent=4, separators=(',', ': ')))
    def cleanAndValidate(self):
        self.checkIsOk()
        # numTabs = self.countNodeType(self.configFlowRaw, 'tab')
        # if numTabs>1:
        #     raise NotImplementedError('Currently FlowsParser support only one <tab> in config')
        self.configFlow = []
        tmpNodesForRemoving=[]
        tmpCfg      = list(self.configFlowRaw['layers'])
        tmpIdRemove = []
        # (0) raise exception when in flow non-supported node types is presents
        extSupportedNodes = ['tab'] + self.supportedNodes
        for ii in tmpCfg:
            if 'layerType' not in ii.keys():
                raise Exception('Incorrect node config: <layerType> is absent! [%s]' % ii)
            if ii['layerType'] not in extSupportedNodes:
                raise Exception('Non-supported node type [%s], id=[%s]' % (ii['type'], ii['id']))
        # (1) find nodes for remove from graph
        for ii in tmpCfg:
            if ii['layerType'] not in self.supportedNodes:
                tmpNodesForRemoving.append(ii)
        # (2) remove id from wires
        for ii in tmpNodesForRemoving:
            self.removeNodeFromWires(tmpCfg, ii)
        # (3) remove nodes from graph
        for ii in tmpNodesForRemoving:
            tmpCfg.remove(ii)
        # (4) check #wires
        self.checkNumberOfWires(tmpCfg)
        self.configFlow = tmpCfg
    def exportConfig2Json(self, cfg, fout):
        with open(fout, 'w') as f:
            f.write(json.dumps(cfg, indent=4))
    def exportConfigFlow(self, fout):
        self.checkIsOk()
        self.exportConfig2Json(self.configFlow, fout=fout)
    @staticmethod
    def validateJsonFlowAsKerasModel(paramFlowJson):
        try:
            tmpParser = DLSDesignerFlowsParser(paramFlowJson)
            tmpParser.buildKerasTrainer()
            return ('ok', None)
        except Exception as err:
            return ('error', 'Error: %s' % err)
    @staticmethod
    def calculateShapesForModel(paramFlowJson):
        flowParser = DLSDesignerFlowsParser(paramFlowJson)
        _, _, layersDict = flowParser.buildKerasTrainer(isPrecalculateLayersDict=True)
        modelJsonWithShapes = flowParser.configFlowRaw
        tmp = modelJsonWithShapes['layers']
        for ii in tmp:
            tid = ii['id']
            tshapeInp = 'Unknown'
            tshapeOut = 'Unknown'
            if tid in layersDict.keys():
                tlayer = layersDict[tid]
                tshapeInp = tlayer.input_shape
                tshapeOut = tlayer.output_shape
            ii['shape'] = {
                'inp': tshapeInp,
                'out': tshapeOut
            }
        modelJsonWithShapes['layers'] = tmp
        return modelJsonWithShapes
    @staticmethod
    def renderModel2ImageFromJson(paramFlowJson):
        tmpParser = DLSDesignerFlowsParser(paramFlowJson)
        tmpModel,_  = tmpParser.buildKerasTrainer()
        tmpDot = kervis.model_to_dot(tmpModel, show_shapes=True)
        tmpStr = tmpDot.create_png(prog='dot')
        sio = StringIO()
        sio.write(tmpStr)
        sio.seek(0)
        timg = skio.imread(sio)
        return timg
    @staticmethod
    def renderAndSaveModelImageFromJson(paramFlowJson, fout, jobDir = None):
        tmpParser = DLSDesignerFlowsParser(paramFlowJson)
        if jobDir is not None:
            if not os.path.isdir(jobDir):
                jobDir = None
        tmpModel,_ = tmpParser.buildKerasTrainer(pathJobDir=jobDir)
        kplot(tmpModel.model, to_file=fout, show_shapes=True)
        return fout
        # return os.path.basename(fout)
    @staticmethod
    def renderModelImageToTmpFile(paramFlowJson, odir=None, pref='netgraph_', jobDir = None):
        if odir is not None:
            if not os.path.isdir(odir):
                os.mkdir(odir)
        fout = tempfile.mktemp(prefix=pref, suffix='.png', dir=odir)
        tret = DLSDesignerFlowsParser.renderAndSaveModelImageFromJson(paramFlowJson, fout, jobDir)
        return tret

####################################
if __name__=='__main__':
    fnFlowJson    = '../../../data-test/test-models-json/test_cnn1.json'
    fnFlowJsonOut = '../../../data-test/test-models-json/test_cnn1_out.json'
    dirJobs = '../../../data-test/test-models-json/'
    flowParser = DLSDesignerFlowsParser(fnFlowJson)
    flowParser.cleanAndValidate()
    # flowParser.exportConfigFlow(fnFlowJsonOut)
    modelTrainer, modelConfig = flowParser.buildKerasTrainer(pathJobDir=dirJobs)
    modelTrainer.saveModelState('/tmp/', isSaveWeights=False)
    modelJson = flowParser.buildKerasModelInJson()
    kplot(modelTrainer.model, to_file='/tmp/keras_draw.png', show_shapes=True)
    print ('---------------')
    print (json.dumps(modelJson, indent=4))
