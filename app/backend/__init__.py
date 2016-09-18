from flask import Flask
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app_flask = Flask(__name__, static_folder='../frontend', template_folder='../frontend')
app_flask.config.from_object('config.DevelopmentConfig')
if app_flask.config['DEBUG']:
    print ('Flask application config:')
    for ii,pp in enumerate(app_flask.config):
        print ('\t%d : %s -> [%s]' % (ii, pp, app_flask.config[pp]))
async_mode = None
socketio = SocketIO(app_flask, async_mode=async_mode)

from app.backend import api
from app.backend.core import datasets
from app.backend.device import socket
