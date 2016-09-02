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


@blueprint.route('/classified/load')
def load_classified_images():
    layers_path = os.path.join(classified_images_dir, classified_images_file)

    if request.method == 'GET':
        classified_images_return = []
        with open(layers_path, 'r') as f:
            classified_images_loaded = json.load(f)
            for image in classified_images_loaded:
                with open(image['path'], "rb") as image_file:
                    encode = base64.b64encode(image_file.read())
                    image['content'] = encode
                    classified_images_return.append(image)
            return Response(json.dumps(classified_images_return), mimetype='application/json')


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