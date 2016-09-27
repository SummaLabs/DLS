#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json

from flask import Flask, Blueprint
from flask import request, Response, make_response

from app.backend.core.models.flow_parser import DLSDesignerFlowsParser
from app.backend.core.models.mdlpreview import ModelsWatcher

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
@models.route('/checkmodel/', methods=['POST'])
def check_model_json():
    if request.method == "POST":
        jsonData = json.loads(request.data)
        ret = DLSDesignerFlowsParser.validateJsonFlowAsKerasModel(jsonData)
        return Response(json.dumps(ret), mimetype='application/json')
    return Response(json.dumps(('error', 'invalid request')), mimetype='application/json')

@models.route('/listinfo/', methods=['POST', 'GET'])
def check_model_list():
    ret = modelsWatcher.getModelsInfoAsList()
    return Response(json.dumps(ret), mimetype='application/json')

if __name__ == '__main__':
    pass