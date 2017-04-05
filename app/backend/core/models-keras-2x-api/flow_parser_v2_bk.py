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
    MaxPooling2D, AveragePooling2D, Activation, Flatten, InputLayer

from keras.utils.visualize_util import plot as kplot
import keras.utils.visualize_util as kervis

from compiler.ast import flatten

from keras_trainer_v4 import KerasTrainer, getOptimizerJson2Keras
from batcher_image2d import BatcherImage2DLMDB
from cfg import CFG_MODEL_TRAIN, CFG_SOLVER, PREFIX_SNAPSHOT

from flow_parser_v2_helper_bk import buildLayerConvolution1D,\
    buildLayerConvolution2D, buildLayerConvolution3D,\
    buildLayerPooling1D, buildLayerPooling2D, buildLayerPooling3D,\
    buildLayerActivation, buildLayerFlatten, buildLayerDense

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
# values: (is Available, is Correct but currently not available)
dictAvailableConnectionsFromTo = {
    'data' : {
        'data'          : (False, None),
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
        'solver'        : (False, None)
    },
    'convolution1d' : {
        'data'          : (False, None),
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
        'solver'        : (False, None)
    },
    'convolution2d': {
        'data'          : (False, None),
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
        'solver'        : (False, None)
    },
    'convolution3d': {
        'data'          : (False, None),
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
        'solver'        : (False, None)
    },
    'pooling1d': {
        'data'          : (False, None),
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
        'solver'        : (False, None)
    },
    'pooling2d': {
        'data'          : (False, None),
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
        'solver'        : (False, None)
    },
    'pooling3d': {
        'data'          : (False, None),
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
        'solver'        : (False, None)
    },
    'flatten': {
        'data'          : (False, None),
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
        'solver'        : (False, None)
    },
    'activation': {
        'data'          : (False, None),
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
        'solver'        : (True, None)
    },
    'dense' : {
        'data'          : (False, None),
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
        'solver'        : (True,  None)
    },
    'solver' : {
        'data'          : (False, None),
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
        'solver'        : (False, None)
    }
}

dictRequiredFields = {
    'data'          : ['datasetType', 'datasetId'],
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

def getSubsamplingJs2Keras(strSubsamplingJs, subSize = (2,2)):
    if strSubsamplingJs == 'max_pooling':
        return MaxPooling2D(subSize)
    elif strSubsamplingJs == 'average_pooling':
        return AveragePooling2D(subSize)
    else:
        raise NotImplemented('Unknown type if subsampling layer [%s]' % strSubsamplingJs)

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
        #FIXME: remove in feature SolverNode or not?
        # Temporary SolverNode + TrainingParams back-compatibility
        tcfgSolverParams=None
        if 'trainingParams' in self.configFlowRaw.keys():
            tcfgSolverParams = self.configFlowRaw['trainingParams']
        else:
            for idx, node in enumerate(sortedFlow):
                tcfg = node.jsonParams
                ttype = node.jsonCfg['layerType']
                if ttype == 'solver':
                    tcfgSolverParams = tcfg
        if tcfgSolverParams is not None:
            paramNumEpochs      = int(tcfgSolverParams['epochsCount'])
            paramIntSnapshot    = int(tcfgSolverParams['snapshotInterval'])
            paramIntValidation  = int(tcfgSolverParams['validationInterval'])
            batchSize           = int(tcfgSolverParams['batchSize'])
            paramLearningRate   = float(tcfgSolverParams['learningRate'])
            paramOptimizerStr   = tcfgSolverParams['optimizer']
            paramOptimizer      = getOptimizerJson2Keras(paramOptimizerStr, parLR=paramLearningRate)
            paramLossFunction   = tcfgSolverParams['lossFunction']
            if 'modelName' in tcfgSolverParams.keys():
                paramModelName = tcfgSolverParams['modelName']
            else:
                paramModelName = "Unknown Model Name"
            if 'deviceType' in tcfgSolverParams.keys():
                paramDeviceType = tcfgSolverParams['deviceType']
            else:
                paramDeviceType = "cpu"
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
            'modelPrefix':          PREFIX_SNAPSHOT,
            'modelName':            paramModelName,
            'deviceType':           paramDeviceType
        }
        #
        if pathJobDir is not None:
            pathLMDB = os.path.join(pathJobDir, datasetId)
            batcherLMDB = BatcherImage2DLMDB(pathLMDB)
            if not batcherLMDB.isOk():
                raise Exception('Cant load LMDB Dataset from path [%s]' % pathLMDB)
        # Step 2: search Neural Layers:
        if pathJobDir is None:
            paramInputShape = (3, 128, 128)
        else:
            paramInputShape = batcherLMDB.shapeImg
        model.add(InputLayer(input_shape=paramInputShape))
        dictLayers={}
        for idx, node in enumerate(sortedFlow):
            #TODO: append code after night talk
            # print ('[%d/%d] node-type: [%s]' % (idx, len(sortedFlow), node.jsonCfg['layerType']))
            ttype=node.jsonCfg['layerType']
            isGoodLayer = False
            if ttype == 'convolution1d':
                tmpLayer = buildLayerConvolution1D(node)
                isGoodLayer = True
            elif ttype == 'convolution2d':
                tmpLayer = buildLayerConvolution2D(node)
                isGoodLayer = True
            elif ttype == 'convolution3d':
                tmpLayer = buildLayerConvolution3D(node)
                isGoodLayer = True
            elif ttype == 'pooling1d':
                tmpLayer = buildLayerPooling1D(node)
                isGoodLayer = True
            elif ttype == 'pooling2d':
                tmpLayer = buildLayerPooling2D(node)
                isGoodLayer = True
            elif ttype == 'pooling3d':
                tmpLayer = buildLayerPooling3D(node)
                isGoodLayer = True
            elif ttype == 'activation':
                tmpLayer = buildLayerActivation(node)
                isGoodLayer = True
            elif ttype == 'flatten':
                tmpLayer = buildLayerFlatten(node)
                isGoodLayer = True
            elif ttype == 'dense':
                tmpLayer = buildLayerDense(node)
                isGoodLayer = True
            if isGoodLayer:
                model.add(tmpLayer)
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
