#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import os
import json
import decimal

from flask import Flask, Blueprint
from flask import request, Response, make_response

from app.backend.core.utils import getPathForProjectDir

from app.backend.core.models.flow_parser import DLSDesignerFlowsParser
from app.backend.core.models.mdlpreview import ModelsWatcher
from app.backend.core.models.keras_trainer_v3 import KerasTrainer as ModelProcessor

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

@models.route('/inference/image/load/<string:imagePath>', methods=['POST', 'GET'])
def inference_image_load(imagePath):
    with open(imagePath, 'r') as f:
        return f.read()

if __name__ == '__main__':
    pass