import errno
import logging
import logging.handlers
import os

from flask import Flask
from flask_socketio import SocketIO

from config import DevelopmentConfig


def mkdir_p(path):
    """Creates directories recursively
    http://stackoverflow.com/a/600612/190597 (tzot)"""
    try:
        os.makedirs(path, exist_ok=True)  # Python>3.2
    except TypeError:
        try:
            os.makedirs(path)
        except OSError as exc: # Python >2.5
            if exc.errno == errno.EEXIST and os.path.isdir(path):
                pass
            else: raise


def init_logger(cfg):
    mkdir_p(cfg.LOG_DIR)
    mkdir_p(cfg.LOG_DIR_TASK)
    logger = logging.getLogger("dls")
    formatter = logging.Formatter(
        '%(asctime)s %(name)-12s %(levelname)-8s %(message)s')
    handler = logging.handlers.RotatingFileHandler(cfg.LOG_DIR + "/dls.log", maxBytes=1000000, backupCount=5)
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)


config = DevelopmentConfig()
init_logger(config)
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
from app.backend.main.dataset import api
from app.backend.core import models
from app.backend.model import api
from app.backend.device import sockets


