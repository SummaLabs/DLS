from flask import Flask

app_flask = Flask(__name__, static_folder='../frontend', template_folder='../frontend')
app_flask.config.from_object('config.DevelopmentConfig')
if app_flask.config['DEBUG']:
    print ('Flask application config:')
    for ii,pp in enumerate(app_flask.config):
        print ('\t%d : %s -> [%s]' % (ii, pp, app_flask.config[pp]))

from app.backend import api
from app.backend.core import datasets
