from flask import render_template, request
from flask import send_from_directory
from flask import Response
from os.path import dirname, abspath
from app.backend import app

import json


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

