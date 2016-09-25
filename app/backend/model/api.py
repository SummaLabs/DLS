from flask import request
from flask import Response
from app.backend.api import app_flask

import json
import os
import flask

model = flask.Blueprint(__name__, __name__)

models_dir = app_flask.config['DLS_MODELS_BASE_PATH']

model_desc_file_name = 'model-description.json'


@model.route('/load/all')
def load_all_models():

    if request.method == 'GET':
        models = []
        for model_folder in os.listdir(models_dir):
            model_file_path = os.path.join(models_dir, os.path.join(model_folder, model_desc_file_name))
            with open(model_file_path, 'r') as f:
                models.append(json.load(f))

        return Response(json.dumps(models), mimetype='application/json')