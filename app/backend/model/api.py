from flask import request
from flask import Response
from app.backend.api import app_flask

import json
import os
import flask
import werkzeug
import logging

model = flask.Blueprint(__name__, __name__)

models_dir = app_flask.config['DLS_MODELS_BASE_PATH']

model_desc_file_name = 'model-description.json'
logger = logging.getLogger("dls")


@model.route('/load/all')
def load_all_models():

    if request.method == 'GET':
        models = []
        for model_folder in os.listdir(models_dir):
            model_file_path = os.path.join(models_dir, os.path.join(model_folder, model_desc_file_name))
            with open(model_file_path, 'r') as f:
                models.append(json.load(f))

        return Response(json.dumps(models), mimetype='application/json')


@model.route('/uploadFile', methods=['POST'])
def upload_file():

    tempDir = '/inference_tmp'
    dest = app_flask.config['DLS_FILEMANAGER_BASE_PATH'] + tempDir
    print dest
    uploaded = []
    for file in request.files.values():
        print file.filename
        if file.filename :
            filename = werkzeug.utils.secure_filename(file.filename)
            fullname = os.path.join(dest, filename)
            logger.info('uploading file to ' + fullname)
            file.save(fullname)
            uploaded.append( os.path.join(tempDir, filename))
    return Response(json.dumps(uploaded), mimetype='application/json')