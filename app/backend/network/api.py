from flask import request
from flask import Response
from os.path import dirname

import json
import re
import shutil
import stat
import os
import flask
import PIL.Image

network = flask.Blueprint(__name__, __name__)

layers_dir = os.path.join(dirname(dirname(dirname(dirname(__file__)))), 'data/network/layers')
saved_dir = os.path.join(dirname(dirname(dirname(dirname(__file__)))), 'data/network/saved')


@network.route('/layer/categories')
def network_layer_categories():
    layers_path = os.path.join(layers_dir, 'categories.json')

    if request.method == 'GET':
        with open(layers_path, 'r') as f:
            return Response(json.dumps(json.load(f)), mimetype='application/json')


@network.route('/layers')
def network_layers():
    layers_path = os.path.join(layers_dir, 'library.json')

    if request.method == 'GET':
        with open(layers_path, 'r') as f:
            return Response(json.dumps(json.load(f)), mimetype='application/json')


@network.route('/saved/names')
def load_saved_network_names():
    networks_names = []

    for file in os.listdir(saved_dir):
        if file.endswith(".json"):
            with open(os.path.join(saved_dir, file), 'r') as f:
                data = json.load(f)
                if data.get('preview') is not None:
                    networks_names.append({
                        'name': re.sub(".json", "", file),
                        'preview': data['preview'],
                        'size': len(data['layers'])
                    })
                else:
                    networks_names.append({
                        'name': re.sub(".json", "", file),
                        'preview': '',
                        'size': len(data['layers'])
                    })

    if request.method == 'GET':
        return Response(json.dumps(networks_names), mimetype='application/json')


@network.route('/load/<path:filename>')
def load_network(filename):
    saved_path = os.path.join(saved_dir, str(filename) + ".json")
    if request.method == 'GET':
        with open(saved_path, 'r') as f:
            data = json.load(f)
            data['name'] = filename
            return Response(json.dumps(data), mimetype='application/json')


@network.route('/save', methods=["POST"])
def save_network():
    if request.method == "POST":
        net_config = json.loads(request.data)
        file_out_name = net_config['name'] + ".json"
        file_out = os.path.join(saved_dir, file_out_name)

        try:
            with open(file_out, 'w') as f:
                f.write(json.dumps(net_config, indent=2))
            ret = ['ok', file_out_name]
        except Exception as err:
            ret = ['error', 'Cant save file [%s], Error: [%s]' % (file_out_name, str(err))]

    return Response(json.dumps(ret), mimetype='application/json')


@network.route('/remove/<path:filename>')
def remove(filename):
    full_path = os.path.join(saved_dir, str(filename) + ".json")
    try:
        os.remove(full_path)
        ret = ['ok', full_path]
    except Exception as err:
        ret = ['error', 'Cant remove file [%s], Error: [%s]' % (full_path, str(err))]

    return Response(json.dumps(ret), mimetype='application/json')
