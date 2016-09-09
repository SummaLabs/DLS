from flask import render_template, request
from flask import send_from_directory
from app.backend import app_flask

import os
from os.path import dirname

from flask_sockets import Sockets
from app.backend.network.api import network
from app.backend.file_manager.api import file_manager
from app.backend.images.api import images

sockets = Sockets(app=app_flask)

app_flask.register_blueprint(network, url_prefix='/network')
app_flask.register_blueprint(file_manager, url_prefix='/fm')
app_flask.register_blueprint(images, url_prefix='/images')

@app_flask.route('/')
@app_flask.route('/index')
def index():
    user = {'nickname': 'unknown'}
    return render_template("index.html", title='Home', user=user)


@app_flask.route('/comms')
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

@app_flask.route('/icons/<path:filename>')
def route_static_icons(filename):
    rootDir = os.path.dirname(__file__)
    return send_from_directory(os.path.join(rootDir, 'static', 'icons'), filename)

@app_flask.route('/views/<path:filename>')
def template(filename):
    rootDir = os.path.dirname(__file__)
    return send_from_directory(os.path.join(rootDir, 'static', 'views'), filename)

@app_flask.route('/src/templates/<path:filename>')
def file_manager(filename):
    rootDir = os.path.dirname(__file__)
    return send_from_directory(os.path.join(dirname(rootDir), 'frontend', 'components', 'file-manager', 'templates'), filename)
