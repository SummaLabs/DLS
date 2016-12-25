#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import json
import decimal

import numpy as np
import keras
import matplotlib.pyplot as plt
import skimage.transform as sktf
import skimage.io as skio

from app.backend.core import utils as dlsutils
from app.backend.core.models.cfg import PREFIX_WEIGHT_DIR, PREFIX_WEIGHT_VIS

from flask import Flask, Blueprint
from flask import request, Response, make_response

from app.backend.core.utils import getPathForProjectDir

from app.backend.core.models.flow_parser import DLSDesignerFlowsParser
from app.backend.core.models.mdlpreview import ModelsWatcher
from app.backend.core.models.keras_trainer_v4 import KerasTrainer as ModelProcessor
import config

models = Blueprint(__name__, __name__)

###############################
modelsWatcher = ModelsWatcher()
modelsWatcher.refreshModelsInfo()
#FIXME: only for DEBUG!
if len(modelsWatcher.dictModelsInfo.keys())<1:
    print ('!!! WARNING !!!! Models not found! Please prepare models:\n\tjust run scripts: '
           '\t$DLS_GIT_ROOT/data-test/run02-create-test-DLS-model-train-dir.sh'
           'and'
           '\t$DLS_GIT_ROOT/data-test/run03-train-test-model-on-available-datasets.sh')
else:
    print ('\nAvailable models: ')
    for ii,db in enumerate(modelsWatcher.dictModelsInfo.values()):
        print ('\t%d : %s' % (ii, db))

####################################
class DecimalEncoder(json.JSONEncoder):
    def _iterencode(self, o, markers=None):
        if isinstance(o, decimal.Decimal):
            # wanted a simple yield str(o) in the next line,
            # but that would mean a yield on the line with super(...),
            # which wouldn't work (see my comment below), so...
            return (str(o) for o in [o])
        return super(DecimalEncoder, self)._iterencode(o, markers)

####################################
@models.route('/inference/', methods=['POST'])
def inference_model_fast():
    print ('---')
    dataJson = json.loads(request.data)
    modelId     = dataJson['modelId']
    lstFilesFM  = dataJson['imagesPath']
    if modelId not in modelsWatcher.dictModelsInfo.keys():
        return Response(json.dumps({'status': 'error: invalid model-id'}), mimetype='application/json')
    modelInfo = modelsWatcher.dictModelsInfo[modelId]
    dirFM = getPathForProjectDir()
    # (1) create full-paths
    lstRealFiles = [os.path.join(dirFM, xx[1:]) for xx in lstFilesFM]
    # (2) filter non-existed files
    lstRealFiles = [xx for xx in lstRealFiles if os.path.isfile(xx)]
    if len(lstRealFiles)<1:
        return Response(json.dumps({'status': 'error: invalid files paths'}), mimetype='application/json')
    modelProcessor = ModelProcessor()
    modelProcessor.loadModelFromTrainingStateInDir(modelInfo.dirModel)
    retInference=[]
    try:
        for pp in lstRealFiles:
            tret = modelProcessor.inferOneImagePathSorted(pp)
            # Convert probabilities in floats to strings:
            #FIXME: i think that this is a stupid code...
            tmp = [(xx[0], '%0.3f' % xx[1]) for xx in tret['distrib']]
            tret['distrib'] = tmp
            tret['best']['prob'] = '%0.3f' % tret['best']['prob']
            retInference.append({
                'filepath': pp,
                'result':   tret
            })
    except Exception as err:
        strErr = 'error: %s' % err
        return Response(json.dumps({'status': strErr}), mimetype='application/json')
    ret = {
        'status': 'ok',
        'data':   retInference
    }
    return Response(json.dumps(ret, cls=DecimalEncoder), mimetype='application/json')

@models.route('/checkmodel/', methods=['POST'])
def check_model_json():
    if request.method == "POST":
        jsonData = json.loads(request.data)
        ret = DLSDesignerFlowsParser.validateJsonFlowAsKerasModel(jsonData)
        return Response(json.dumps(ret), mimetype='application/json')
    return Response(json.dumps(('error', 'invalid request')), mimetype='application/json')

@models.route('/layers/visualization/<path:model_id>')
def vis_model_json(model_id):
    if request.method == "GET":
        modelId = model_id
        if modelId not in modelsWatcher.dictModelsInfo.keys():
            return Response(json.dumps(('error', 'invalid model-id [%s]' % modelId)), mimetype='application/json')
        try:
            retJson = generateModelWeightsVis(modelId=modelId)
        except Exception as err:
            return Response(json.dumps(('error', 'Exception: [%s]' % err)), mimetype='application/json')
        return Response(json.dumps(retJson), mimetype='application/json')
    return Response(json.dumps(('error', 'invalid request')), mimetype='application/json')

@models.route('/image/<path:image_path>', methods=['GET'])
def load_image(image_path):
    with open(image_path, 'r') as f:
        return f.read()

@models.route('/calcshape/', methods=['POST'])
def calcshape_model_json():
    if request.method == "POST":
        jsonData = json.loads(request.data)
        try:
            modelWithSahpes = DLSDesignerFlowsParser.calculateShapesForModel(jsonData)
            ret = {
                'status':   'ok',
                'data':     modelWithSahpes
            }
        except Exception as err:
            ret={
                'status':   'error',
                'data':     'Error: %s' % err
            }
        return Response(json.dumps(ret), mimetype='application/json')
    return Response(json.dumps({'status': 'error', 'data': 'invalid request'}), mimetype='application/json')


@models.route('/list/info/', methods=['POST', 'GET'])
def check_model_list():
    ret = modelsWatcher.getModelsInfoAsList()
    return Response(json.dumps(ret), mimetype='application/json')

def generateModelWeightsVis(modelId):


    modelInfo = modelsWatcher.dictModelsInfo[modelId]
    # (2) Prepare output directory
    dirBase = modelInfo.dirModel
    dirOut = os.path.join(dirBase, PREFIX_WEIGHT_DIR)
    routeImagePath = 'models/image/' + os.path.relpath(dirOut, config.BASE_DIR)
    cfgOut = os.path.join(dirOut, PREFIX_WEIGHT_VIS)

    modelProcessor = ModelProcessor()
    modelProcessor.loadModelFromTrainingStateInDir(modelInfo.dirModel)
    # (1) Prepare layers:
    lstLayers = []
    retInfo = []
    for ll in modelProcessor.model.layers:
        tmpInfo = {
            'layerName': ll.name,
            'layerType': '%s' % ll.__class__.__name__,
            'layerShape': '%s' % list(ll.output_shape[1:])
        }
        isAppend = False
        if isinstance(ll, keras.layers.Convolution2D):
            isAppend = True
        elif isinstance(ll, keras.layers.Dense):
            isAppend = True
        if isAppend:
            lstLayers.append(ll)
            tmpInfo['previewPath'] = "%s/%s.jpg" % (routeImagePath, ll.name)
        else:
            tmpInfo['previewPath'] = ""
        retInfo.append(tmpInfo)

    dlsutils.makeDirIfNotExists(dirOut)
    # (3) Export images
    for ii, ll in enumerate(lstLayers):
        print ('[%d] * %s, #params = %d' % (ii, ll.name, ll.count_params()))
        foutImg = '%s/%s.jpg' % (dirOut, ll.name)

        if isinstance(ll, keras.layers.Convolution2D):
            tmp = ll.get_weights()
            dataW = tmp[0]
            dataB = tmp[1]
            numFlt = dataW.shape[0]
            sizx = int(3. * np.sqrt(numFlt) / 4.)
            sizy = int(np.floor(float(numFlt) / sizx))
            tsiz = dataW.shape[-2:]
            cnt = 0
            mapFlt = None
            for xx in range(sizx):
                tmp = None
                for yy in range(sizy):
                    if cnt > numFlt:
                        tflt = np.zeros(tsiz)
                    else:
                        tflt = dataW[cnt].mean(axis=0)
                    tflt = np.pad(tflt, 1, 'constant')
                    if tmp is None:
                        tmp = tflt
                    else:
                        tmp = np.hstack((tmp, tflt))
                    cnt += 1
                if mapFlt is None:
                    mapFlt = tmp
                else:
                    mapFlt = np.vstack((mapFlt, tmp))
            maxShape = max(mapFlt.shape)
            # FIXME: check this point
            if maxShape < 512:
                newShape = np.floor((512. / maxShape) * np.array(mapFlt.shape)).astype(np.int)
                mapFlt = sktf.resize(mapFlt, newShape, order=0)
            # draw image over figure
            plt.imsave(foutImg, mapFlt)
        elif isinstance(ll, keras.layers.Dense):
            tmp = ll.get_weights()
            dataW = tmp[0]
            dataB = tmp[1]
            nr, nc = dataW.shape
            sizMin = min(dataW.shape)
            sizMax = max(dataW.shape)
            koef = float(sizMax) / float(sizMin)
            koefGood = 2. / 4.
            mult = koefGood * koef
            if nr < nc:
                newShape = (int(nr * mult), nc)
            else:
                newShape = (nr, int(nc * mult))
            mapW = sktf.resize(dataW, newShape, order=0)
            if nc < nr:
                mapW = mapW.transpose()
            # draw image over figure
            plt.imsave(foutImg, mapW)
    with open(cfgOut, 'w') as f:
        f.write(json.dumps(retInfo, indent=4))
    return retInfo

@models.route('/fs/load/<path:model_id>', methods=['GET'])
def load_feature_space(model_id):
    #return Response(open('/home/ar/projects/DLS/temp/fspace-out-20161218-080508-410197/fspace-train.json', 'r').read(), mimetype='application/json')
    return Response(json.dumps(modelsWatcher.getFeatureSpace(model_id)), mimetype='application/json')


if __name__ == '__main__':
    modelId = 'mdltask-20161217-172716-664949'
    generateModelWeightsVis(modelId=modelId)
