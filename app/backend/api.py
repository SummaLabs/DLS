from flask import render_template, request
from flask import send_from_directory
from app.backend import app

import os
from flask_sockets import Sockets

sockets = Sockets(app=app)

import network.api
app.register_blueprint(network.api.blueprint, url_prefix='/network')

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
