from flask import request
from flask import Response
from os.path import dirname

import json
import os
import flask
import base64

images = flask.Blueprint(__name__, __name__)

classified_images_file = "classified-images-123123123123.json"
classified_images_dir = os.path.join(dirname(dirname(dirname(dirname(__file__)))), 'data/app/tmp')


@images.route('/classify/<path:images_path>')
def load_classified_images(images_path):
    layers_path = os.path.join(classified_images_dir, classified_images_file)

    if request.method == 'GET':

        import time
        time.sleep(3)
        classified_images_return = []
        with open(layers_path, 'r') as f:
            classified_images_loaded = json.load(f)
            for image in classified_images_loaded['images']:
                with open(image['path'], "rb") as image_file:
                    imageEncode = base64.b64encode(image_file.read())
                    classified_images_return.append(create_image_n_classes(image, int(3), imageEncode))
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


@images.route('/classified/download')
def download_classified_images_csv():
    layers_path = os.path.join(classified_images_dir, classified_images_file)
    with open(layers_path, 'r') as f:
        classified_images_json = json.load(f)
        classes = classified_images_json['classes']
        images = classified_images_json['images']
        # csv header
        csv = "path,"
        classes_len = len(classes)
        for index in range(classes_len):
            csv += classes[index]
            if index < classes_len:
                csv += ","
        csv += '\n'
        # csv content
        for image in images:
            csv += image['path'] + ','
            for classProbability in image['classProbabilities']:
                classes_len = len(classes)
                for index in range(classes_len):
                    classes_index_ = classes[index]
                    name_ = classProbability['name']
                    if classes_index_ == name_:
                        csv += classProbability['value']
                        if index < classes_len - 1:
                            csv += ","
                        else:
                            csv += '\n'

    return Response(
        csv,
        mimetype="text/csv",
        headers={"Content-disposition":
                     "attachment; classified_images.csv"})


@images.route('/dataset/roc/load/<path:id>')
def load_images_data_set_roc(id):
    images_path = os.path.join(classified_images_dir, id)

    if request.method == 'GET':
        with open(images_path, 'r') as f:
            image_data_set_roc = json.load(f)
            return Response(json.dumps(image_data_set_roc), mimetype='application/json')