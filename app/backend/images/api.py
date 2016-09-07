from flask import request
from flask import Response
from os.path import dirname

import json
import os
import flask
import base64

blueprint = flask.Blueprint(__name__, __name__)

classified_images_file = "classified-images-123123123123.json"
classified_images_dir = os.path.join(dirname(dirname(dirname(dirname(__file__)))), 'data/app/tmp')


@blueprint.route('/classified/load/<path:class_number>')
def load_classified_images(class_number):
    layers_path = os.path.join(classified_images_dir, classified_images_file)

    if request.method == 'GET':
        classified_images_return = []
        with open(layers_path, 'r') as f:
            classified_images_loaded = json.load(f)
            for image in classified_images_loaded:
                with open(image['path'], "rb") as image_file:
                    imageEncode = base64.b64encode(image_file.read())
                    classified_images_return.append(create_image_n_classes(image, int(class_number), imageEncode))
            return Response(json.dumps(classified_images_return), mimetype='application/json')


def create_image_n_classes(classified_image, n, imageEncode):
    n_class_probabilities = []
    class_probabilities = classified_image['classProbabilities']
    for index in range(len(class_probabilities)):
        if index < n:
            n_class_probabilities.append(class_probabilities[index])

    path_ = classified_image['path']
    head, tail = os.path.split(path_)

    return {'name': tail,
            'content': imageEncode,
            'classProbabilities': n_class_probabilities}


@blueprint.route('/classified/download')
def download_classifide_mages_json():
    layers_path = os.path.join(classified_images_dir, classified_images_file)

    with open(layers_path, 'r') as f:
        file_content = f.read()
    return Response(
        file_content,
        mimetype="text/csv",
        headers={"Content-disposition":
                     "attachment; filename=myplot.csv"})


@blueprint.route('/dataset/roc/load/<path:id>')
def load_images_data_set_roc(id):
    images_path = os.path.join(classified_images_dir, id)

    if request.method == 'GET':
        with open(images_path, 'r') as f:
            image_data_set_roc = json.load(f)
            return Response(json.dumps(image_data_set_roc), mimetype='application/json')