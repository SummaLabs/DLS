from flask import request
from flask import Response
from app.backend.api import app_flask

import json
import os
import flask
import werkzeug
import logging

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

model = flask.Blueprint(__name__, __name__)

modelsWatcher = ModelsWatcher()
modelsWatcher.refreshModelsInfo()

models_dir = app_flask.config['DLS_MODELS_BASE_PATH']

model_desc_file_name = 'model-description.json'
logger = logging.getLogger("dls")


@model.route('/all/metadata/list', methods=['GET'])
def list_models_metadata():
    metadata = modelsWatcher.getModelsInfoAsList()
    return Response(json.dumps(metadata), mimetype='application/json')


@model.route('/inference/', methods=['POST'])
def model_inference():
    request_data = json.loads(request.data)
    model_id = request_data['modelId']
    images = request_data['images']
    if model_id not in modelsWatcher.dictModelsInfo.keys():
        return Response(json.dumps({'status': 'error: invalid model id'}), mimetype='application/json')

    model_metadata = modelsWatcher.dictModelsInfo[model_id]
    fs_root_path = getPathForProjectDir()
    # (1) create full-paths
    imgs_paths = [os.path.join(fs_root_path, img[1:]) for img in images]
    # (2) filter non-existed files
    imgs_paths = [ip for ip in imgs_paths if os.path.isfile(ip)]
    if len(imgs_paths) < 1:
        return Response(json.dumps({'status': 'error: invalid files paths'}), mimetype='application/json')

    model_processor = ModelProcessor()
    model_processor.loadModelFromTrainingStateInDir(model_metadata.dirModel)
    inference=[]
    try:
        for ip in imgs_paths:
            result = model_processor.inferOneImagePathSorted(ip)
            # Convert probabilities from floats to strings:
            classes_prob = [(xx[0], '%0.3f' % xx[1]) for xx in result['distrib']]
            inference.append({
                'imagePath': ip,
                'classProbabilities': classes_prob
            })
    except Exception as err:
        return Response(json.dumps({'status': 'error: %s' % err}), mimetype='application/json')

    return Response(json.dumps({'status': 'ok', 'data': inference}, cls=DecimalEncoder), mimetype='application/json')


class DecimalEncoder(json.JSONEncoder):
    def _iterencode(self, o, markers=None):
        if isinstance(o, decimal.Decimal):
            # wanted a simple yield str(o) in the next line,
            # but that would mean a yield on the line with super(...),
            # which wouldn't work (see my comment below), so...
            return (str(o) for o in [o])
        return super(DecimalEncoder, self)._iterencode(o, markers)


@model.route('/uploadFile', methods=['POST'])
def upload_file():

    inf_tmp_dir = '/inference_tmp'
    inf_tmp_dir_path = app_flask.config['DLS_FILEMANAGER_BASE_PATH'] + inf_tmp_dir

    if not os.path.exists(inf_tmp_dir_path):
        os.makedirs(inf_tmp_dir_path)

    uploaded = []
    for file in request.files.values():
        print file.filename
        if file.filename :
            filename = werkzeug.utils.secure_filename(file.filename)
            fullname = os.path.join(inf_tmp_dir_path, filename)
            logger.info('uploading file to ' + fullname)
            file.save(fullname)
            uploaded.append( os.path.join(inf_tmp_dir, filename))
    return Response(json.dumps(uploaded), mimetype='application/json')