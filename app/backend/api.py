from flask import render_template
from flask_sockets import Sockets

from app.backend import app_flask
from app.backend.env.api import environment
from app.backend.file_manager.api import file_manager
from app.backend.dataset.api import dataset
from app.backend.model.api import model
from app.backend.network.api import network
from app.backend.task.api import task
from app.backend.util.api import util

sockets = Sockets(app=app_flask)

app_flask.register_blueprint(network, url_prefix='/network')
app_flask.register_blueprint(model, url_prefix='/model')
app_flask.register_blueprint(dataset, url_prefix='/dataset')
app_flask.register_blueprint(task, url_prefix='/task')
app_flask.register_blueprint(environment, url_prefix='/environment')
app_flask.register_blueprint(file_manager, url_prefix='/fm')
app_flask.register_blueprint(util, url_prefix='/util')


@app_flask.route('/')
@app_flask.route('/index')
def index():
    user = {'nickname': 'unknown'}
    return render_template("index.html", title='Home', user=user)