#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json

from compiler.ast import flatten

import warnings as warn

import toposort

import keras

from flow_parser_helper_basic import dictAvailableConnectionsFromTo, dictRequiredFields
from flow_parser_helper_nodes import *
from flow_parser_helper_opt import getOptimizerJson2Keras, getKerasOptimizerName
import cfg as mcfg

from keras_trainer_v4 import KerasTrainer

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

####################################
class DLSDesignerFlowsParser:
    configFlowRaw    = None
    configFlow       = None
    configFlowLinked = None
    configFlowLinkedSorted = None
    supportedNodes   = dictRequiredFields.keys()
    reqiredNodes     = ['datainput', 'dataoutput']
    def __init__(self, jsonFlow):
        if isinstance(jsonFlow, basestring):
            with open(jsonFlow, 'r') as f:
                self.configFlowRaw = json.load(f)
        elif isinstance(jsonFlow, dict):
            self.configFlowRaw = jsonFlow
        else:
            raise Exception('Unknown type for Model flow [%s]' % type(jsonFlow))
    def clear(self):
        self.configFlow       = None
        self.configFlowRaw    = None
        self.configFlowLinked = None
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
        nodeBuilder = NodeFBuilder()
        for ii in cfg:
            tmpNode = nodeBuilder.newNodeF(ii) #NodeF(ii)
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
            warn.warn('Flow have more than one input nodes (currently not implemented) or not linked [%s]' % tmpInputNodes, FutureWarning)
            # raise NotImplementedError('Flow have more than one input nodes (currently not implemented) or not linked [%s]' % tmpInputNodes)
        if len(tmpInputNodes)<1:
            raise Exception('Unknown graph connection')
        #FIXME: for backward-compatibility
        lstFlowNodes = lstNodes
        # Old-code:
        # lstFlowNodes = []
        # firstNode = tmpInputNodes[0]
        # lstFlowNodes.append(firstNode)
        # maxCnt=5000
        # cnt=0
        # tmpNode = firstNode
        # while cnt<maxCnt:
        #     if tmpNode.outNode is not None:
        #         tmpNode = tmpNode.outNode[0] #FIXME: work only for sequential models
        #         lstFlowNodes.append(tmpNode)
        #     else:
        #         break
        #     cnt+=1
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
    def buildConnectedFlow(self, isCheckConnections=True):
        self.configFlowLinked = self.getConnectedFlow(isCheckConnections=isCheckConnections)
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
                raise Exception('Non-supported node type [%s], id=[%s]' % (ii['layerType'], ii['id']))
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
        # self.checkNumberOfWires(tmpCfg)
        self.configFlow = tmpCfg
    def exportConfig2Json(self, cfg, fout):
        with open(fout, 'w') as f:
            f.write(json.dumps(cfg, indent=4))
    def exportConfigFlow(self, fout):
        self.checkIsOk()
        self.exportConfig2Json(self.configFlow, fout=fout)
    def generateModelKerasConfigJson(self, modelName='model_1', dbWatcher=None):
        self.checkIsOk()
        if self.configFlowLinked is None:
            raise Exception('Node-linked Flow is not prepared, please call ::buildConnectedFlow() before!')
        # (0) Prepare topological sorted model flow
        tmpIdxDict = {}
        for ii,ll in enumerate(self.configFlowLinked):
            tmpIdxDict[ll] = ii
        tmpTopoDict = {}
        for ii, ll in enumerate(self.configFlowLinked):
            tmpIdxSet = set({})
            if ll.outNode is not None:
                for kk in ll.outNode:
                    tmpIdxSet.add(tmpIdxDict[kk])
            tmpTopoDict[ii] = tmpIdxSet
        # sortedFlowIdx  = list(toposort.toposort(tmpTopoDict))[::-1]
        sortedFlowIdx = list(toposort.toposort_flatten(tmpTopoDict))[::-1]
        self.configFlowLinkedSorted = [self.configFlowLinked[idx] for idx in sortedFlowIdx]
        #FIXME: this is a temporary solution
        tmpExcludeNodes={'dataoutput'}
        # (1) Basic model json-template
        modelTemplate = {
            "class_name":   "Model",
            "keras_version": keras.__version__,
            "config": {
                "name": "%s" % modelName,
                "layers" : [],
                "input_layers": [],
                "output_layers": [],
            }
        }
        # (2) Generate layers configs
        tmpLayersCfg = []
        retDatasetIdx=[]
        for ii,nn in enumerate(self.configFlowLinkedSorted):
            if nn.type() in tmpExcludeNodes:
                continue
            if isinstance(nn,NodeDataInput):
                if dbWatcher is None:
                    tmpCfg = nn.getConfig()
                else:
                    #FIXME: move this code to methods of DBInfo class & NodeDataInput
                    tdbIdx = nn.jsonParams['datasetId']
                    retDatasetIdx.append(tdbIdx)
                    if tdbIdx not in dbWatcher.dictDbInfo.keys():
                        raise Exception ('Invalid dataset ID [%s] in network config of node [%s]' % (tdbIdx, nn.getName()))
                    # FIXME: in future we must support two shape types: Theano (3,128,128) & Tensorflow (128,128,3)
                    tmpDbShape = dbWatcher.dictDbInfo[tdbIdx].getInfoStat()['shape'].values()
                    tmpCfg = nn.getConfig(inputShape=tmpDbShape)
            else:
                tmpCfg = nn.getConfig()
            inboundNodes = []
            if nn.inpNode is not None:
                for kk in nn.inpNode:
                    if kk.type() not in tmpExcludeNodes:
                        inboundNodes.append([
                            kk.getName(),
                            0,
                            0
                        ])
            if len(inboundNodes)>0:
                tmpCfg['inbound_nodes'] = [inboundNodes]
            else:
                tmpCfg['inbound_nodes'] = []
            tmpLayersCfg.append(tmpCfg)
        modelTemplate['config']['layers'] = tmpLayersCfg
        # (3) Generate input model info
        tmpInputLayers = []
        for ii, nn in enumerate(self.configFlowLinkedSorted):
            if isinstance(nn, NodeDataInput):
                tmpInputLayers.append([
                    nn.getName(),
                    0,
                    0
                ])
        # (4) Generate output model info
        tmpOutputLayers = []
        for ii, nn in enumerate(self.configFlowLinkedSorted):
            if nn.type() == 'dataoutput':
                tmpOutputLayers.append([
                    nn.inpNode[0].getName(),
                    0,
                    0
                ])
        modelTemplate['config']['input_layers'] = tmpInputLayers
        modelTemplate['config']['output_layers'] = tmpOutputLayers
        return (modelTemplate, retDatasetIdx)
    @staticmethod
    def validateJsonFlowAsKerasModel(paramFlowJson):
        try:
            tmpParser = DLSDesignerFlowsParser(paramFlowJson)
            tmpParser.cleanAndValidate()
            tmpParser.buildConnectedFlow()
            return ('ok', None)
        except Exception as err:
            return ('error', 'Error: %s' % err)
    def buildKerasTrainer(self, isUseDatasetWatcher=True):
        self.cleanAndValidate()
        # (1) Build connected and validated Model Node-flow (DLS-model-representation)
        self.buildConnectedFlow()
        # (2) Generate dict-based Json Kearas model (from DLS model representation)
        if isUseDatasetWatcher:
            # (2.1) Import pointer to DatasetWatcher
            from app.backend.dataset.api import datasetWatcher as dbWatcher
            from batcher_image2d import BatcherImage2DLMDB
            modelJson, tmpLstDatasetIdx = self.generateModelKerasConfigJson(dbWatcher=dbWatcher)
            if len(tmpLstDatasetIdx)<0:
                raise Exception('Cant find input data slots for network...')
            if len(tmpLstDatasetIdx)>1:
                raise Exception('DLS currently not supported multiple input training')
            dbIdx = tmpLstDatasetIdx[0]
            pathLMDB = dbWatcher.dictDbInfo[dbIdx].pathDB
            batcherLMDB = BatcherImage2DLMDB(pathLMDB)
            datasetId = dbIdx
        else:
            #FIXME: check this point, i think this is a bad idea...
            modelJson, tmpLstDatasetIdx = self.generateModelKerasConfigJson()
            batcherLMDB = None
            datasetId = 'unknown-id'
        model = keras.models.model_from_config(modelJson)
        # (3) Prepare solver params:
        if 'trainingParams' not in self.configFlowRaw.keys():
            raise Exception('Invalid network config: [trainingParams] key is absent...')
        tcfgSolverParams = self.configFlowRaw['trainingParams']
        # (4) Solver params
        paramNumEpochs = int(tcfgSolverParams['epochsCount'])
        paramIntSnapshot = int(tcfgSolverParams['snapshotInterval'])
        paramIntValidation = int(tcfgSolverParams['validationInterval'])
        batchSize = int(tcfgSolverParams['batchSize'])
        paramLearningRate = float(tcfgSolverParams['learningRate'])
        paramOptimizerStr = tcfgSolverParams['optimizer']
        paramOptimizer = getOptimizerJson2Keras(paramOptimizerStr, parLR=paramLearningRate)
        paramLossFunction = tcfgSolverParams['lossFunction']
        if 'modelName' in tcfgSolverParams.keys():
            paramModelName = tcfgSolverParams['modelName']
        else:
            paramModelName = "Unknown Model Name"
        if 'deviceType' in tcfgSolverParams.keys():
            paramDeviceType = tcfgSolverParams['deviceType']
        else:
            paramDeviceType = "cpu"
        cfgJsonOptimizer = {
            'name': paramOptimizerStr,
            'lr': paramLearningRate,
            'nesterov': True,
            'momentum': 0.9,
            'decay': 1.0e-6
        }
        cfgJsonSolver = {
            'optimizer': cfgJsonOptimizer,
            'loss': paramLossFunction,
            'metrics': ['loss', 'acc'],
            'dataset-id': datasetId,
            'pathModelConfig': mcfg.CFG_MODEL_TRAIN,
            'sizeBatch': batchSize,
            'numEpoch': paramNumEpochs,
            'currentIter': 0,  # FIXME: check this point, initialize variable from previous Solver-state
            'intervalSaveModel': paramIntSnapshot,
            'intervalValidation': paramIntValidation,
            'printInterval': paramIntValidation,
            'modelPrefix': mcfg.PREFIX_SNAPSHOT,
            'modelName': paramModelName,
            'deviceType': paramDeviceType
        }
        if isUseDatasetWatcher:
            kerasTrainer = KerasTrainer()
            kerasTrainer.buildModelFromConfigs(batcherLMDB, model,
                                               sizeBatch=batchSize,
                                               numEpoch=paramNumEpochs,
                                               modelOptimizer=paramOptimizer,
                                               intervalSaveModel=paramIntSnapshot,
                                               intervalValidation=paramIntValidation)
        else:
            kerasTrainer = KerasTrainer()
            kerasTrainer.model = model
        return (kerasTrainer, cfgJsonSolver)

####################################
if __name__=='__main__':
    import app.backend.core.utils as dlsutils
    from app.backend.core.datasets.dbpreview import DatasetsWatcher
    #
    dirData = dlsutils.getPathForDatasetDir()
    dbWatcher = DatasetsWatcher(dirData)
    dbWatcher.refreshDatasetsInfo()
    #
    foutJson = 'keras-model-generated-db.json'
    # fnFlowJson = '../../../../data/network/saved/testnet_multi_input_multi_output_v1.json'
    fnFlowJson = '../../../../data/network/saved/test_simple_cnn_model1.json'
    flowParser = DLSDesignerFlowsParser(fnFlowJson)
    flowParser.cleanAndValidate()
    # (1) Build connected and validated Model Node-flow (DLS-model-representation)
    flowParser.buildConnectedFlow()
    # (2) Generate dict-based Json Kearas model (from DLS model representation)
    modelJson, lstDBIdx = flowParser.generateModelKerasConfigJson(dbWatcher=dbWatcher)
    keras.models.model_from_config(modelJson).summary()
