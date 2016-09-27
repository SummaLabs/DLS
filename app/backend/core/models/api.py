#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json

from flask import Flask, Blueprint
from flask import request, Response, make_response

from app.backend.core.models.flow_parser import DLSDesignerFlowsParser

models = Blueprint(__name__, __name__)

@models.route('/checkmodel/', methods=['POST'])
def check_model_json():
    if request.method == "POST":
        jsonData = json.loads(request.data)
        ret = DLSDesignerFlowsParser.validateJsonFlowAsKerasModel(jsonData)
        return Response(json.dumps(ret), mimetype='application/json')
    return Response(json.dumps(('error', 'invalid request')), mimetype='application/json')

if __name__ == '__main__':
    pass