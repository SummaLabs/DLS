from flask import request
from flask import Response
from os.path import dirname

import json
import os
import flask
import base64

from app.backend import app_flask

images = flask.Blueprint(__name__, __name__)


models_dir = app_flask.config['DLS_MODELS_BASE_PATH']


@images.route('/classify' , methods=['POST'])
def classified_images():

    if request.method == 'POST':

        model_id = request.args['modelId']
        images_path = request.args['imagesPath']
        images_path_list = images_path.split(';')

        base_path = os.path.join(dirname(dirname(dirname(dirname(__file__)))), app_flask.config['DLS_FILEMANAGER_BASE_PATH'])


        classified_images_return = build_model_response(base_path, images_path_list)

        import time
        time.sleep(3)

        dumps = json.dumps(classified_images_return)
        return Response(dumps, mimetype='application/json')


def build_model_response(base_path, images_path):
    model_response = {
        'classes': ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9",
                    "Class 10"]}
    images = []
    for path in images_path:
        image = {}
        full_path = os.path.join(base_path, path)
        image['path'] = full_path
        with open(full_path, "rb") as image_file:
            image['content'] = base64.b64encode(image_file.read())

        image['classProbabilities'] = [
            {"name": "Class 1", "value": "80"},
            {"name": "Class 2", "value": "10"},
            {"name": "Class 3", "value": "5"},
            {"name": "Class 4", "value": "3"},
            {"name": "Class 5", "value": "1"},
            {"name": "Class 6", "value": "1"},
            {"name": "Class 7", "value": "1"},
            {"name": "Class 8", "value": "1"},
            {"name": "Class 9", "value": "1"},
            {"name": "Class 10", "value": "80"}
        ]
        images.append(image)

    model_response['images'] = images

    return model_response


@images.route('/load', methods=['GET'])
def load_image():
    imagePath = request.args.get('imagePath')
    with open(imagePath, 'r') as f:
        return f.read()


@images.route('/rocs/load/<path:model_id>')
def load_model_rocs(model_id):

    if request.method == 'GET':

        roc_analysis = []
        validation_dir = os.path.join(models_dir, os.path.join(model_id, 'validation'))
        for roc_file_path in os.listdir(validation_dir):
            with open(os.path.join(validation_dir, roc_file_path), 'r') as f:
                roc_analysis.append(json.load(f))

        return Response(json.dumps(roc_analysis), mimetype='application/json')