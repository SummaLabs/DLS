from flask import render_template, request
from flask import send_from_directory
from flask import Response
from os.path import dirname, abspath
from app.backend import app

import json
import re


import os
from flask_sockets import Sockets

sockets = Sockets(app=app)


@app.route('/')
@app.route('/index')
def index():
    user = {'nickname': 'Denis'}
    return render_template("index.html", title='Home', user=user)


@app.route('/comms')
def api():
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        while True:
            message = ws.wait()
            ws.send(message)

@sockets.route('/comms')
def socket_comms(ws):
    while not ws.closed:
        msg = ws.receive()
        ws.send(msg)

@app.route('/icons/<path:filename>')
def route_static_icons(filename):
    rootDir = os.path.dirname(__file__)
    return send_from_directory(os.path.join(rootDir, 'static', 'icons'), filename)

@app.route('/views/<path:filename>')
def template(filename):
    rootDir = os.path.dirname(__file__)
    return send_from_directory(os.path.join(rootDir, 'static', 'views'), filename)

@app.route('/network/layer/categories')
def network_layer_categories():
    layers_dir = os.path.join(dirname(dirname(dirname(__file__))),  'data/network/layers')
    layers_path = os.path.join(layers_dir, 'layers-categories.json')

    if request.method == 'GET':
        with open(layers_path, 'r') as f:
            return Response(json.dumps(json.load(f)), mimetype='application/json')

@app.route('/network/layers')
def network_layers():
    layers_dir = os.path.join(dirname(dirname(dirname(__file__))),  'data/network/layers')
    layers_path = os.path.join(layers_dir, 'layers-library.json')

    if request.method == 'GET':
        with open(layers_path, 'r') as f:
            return Response(json.dumps(json.load(f)), mimetype='application/json')

@app.route('/network/saved/names')
def load_saved_network_names():
    networks_names = []

    saved_dir = os.path.join(dirname(dirname(dirname(__file__))),  'data/network/saved')
    for file in os.listdir(saved_dir):
        if file.endswith(".json"):
            networks_names.append(re.sub(".json","",file))

    if request.method == 'GET':
            return Response(json.dumps(networks_names), mimetype='application/json')


@app.route('/network/load/<path:filename>')
def load_network(filename):
    saved_dir = os.path.join(dirname(dirname(dirname(__file__))), 'data/network/saved')
    saved_path = os.path.join(saved_dir, str(filename) + ".json")

    if request.method == 'GET':
        with open(saved_path, 'r') as f:
            return Response(json.dumps(json.load(f)), mimetype='application/json')


@app.route('/network/save', methods=["POST"])
def save_network():
    if request.method == "POST":
        net_config = json.loads(request.data)
        file_out_name = net_config['name'] + ".json"
        save_dir = os.path.join(dirname(dirname(dirname(__file__))), 'data/network/saved')
        file_out = os.path.join(save_dir, file_out_name)
        try:
            with open(file_out, 'w') as f:
                f.write(json.dumps(net_config, indent=2))
            ret = ['ok', file_out_name]
        except Exception as err:
            ret = ['error', 'Cant save file [%s], Error: [%s]' % (file_out_name, str(err))]

    return Response(json.dumps(ret), mimetype='application/json')
