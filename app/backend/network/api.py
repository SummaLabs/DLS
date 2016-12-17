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

root_path = os.path.join(dirname(dirname(dirname(dirname(__file__)))), 'data/network')

layers_dir = os.path.join(root_path, 'layers')
network_dir = {
    'custom': 'saved',
    'prepared': 'library'
}


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
    networks = []

    path_custom_network = os.path.join(root_path, network_dir['custom'])
    path_prepared_network = os.path.join(root_path, network_dir['prepared'])

    for file_name in os.listdir(path_custom_network):
        networks += read_network(path_custom_network, file_name, 'custom')
    for file_name in os.listdir(path_prepared_network):
        networks += read_network(path_prepared_network, file_name, 'prepared')

    if request.method == 'GET':
        return Response(json.dumps(networks), mimetype='application/json')



@network.route('/load/<path:type>/<path:filename>')
def load_network(type, filename):
    saved_path = os.path.join(root_path, network_dir[type], filename + ".json")
    if request.method == 'GET':
        with open(saved_path, 'r') as f:
            data = json.load(f)
            data['name'] = filename
            return Response(json.dumps(data), mimetype='application/json')


@network.route('/load/complex/<path:filename>')
def load_network(filename):
    saved_path = os.path.join(root_path, "complex", filename + ".json")
    print(saved_path)
    if request.method == 'GET':
        with open(saved_path, 'r') as f:
            data = json.load(f)
            return Response(json.dumps(data), mimetype='application/json')


@network.route('/save', methods=["POST"])
def save_network():
    if request.method == "POST":
        net_config = json.loads(request.data)
        file_out_name = net_config['name'] + ".json"
        file_out = os.path.join(root_path, network_dir['custom'], file_out_name)

        try:
            with open(file_out, 'w') as f:
                f.write(json.dumps(net_config, indent=2))
            ret = ['ok', file_out_name]
        except Exception as err:
            ret = ['error', 'Cant save file [%s], Error: [%s]' % (file_out_name, str(err))]

    return Response(json.dumps(ret), mimetype='application/json')


@network.route('/remove/<path:type>/<path:filename>')
def remove(type, filename):
    full_path = os.path.join(root_path, network_dir[type], str(filename) + ".json")
    try:
        os.remove(full_path)
        ret = ['ok', full_path]
    except Exception as err:
        ret = ['error', 'Cant remove file [%s], Error: [%s]' % (full_path, str(err))]

    return Response(json.dumps(ret), mimetype='application/json')


def read_network(path, file_name, source):
    networks = []
    if file_name.endswith(".json"):
        with open(os.path.join(path, file_name), 'r') as f:
            data = json.load(f)
            network_item = {
                'name': re.sub(".json", "", file_name),
                'size': len(data['layers']),
                'source': source,
                'preview': ''
            }
            if data.get('preview') is not None:
                network_item['preview'] = data['preview']


            networks.append(network_item)
    return networks
