from flask import Response
import flask
import json
from app.backend.env import hardware, env


environment = flask.Blueprint(__name__, __name__)


@environment.route('/info', methods=["GET"])
def get_system_info():
    return Response(hardware.get_system_info(), mimetype='application/json')


@environment.route('/environment/available', methods=["GET"])
def get_available_devices():
    return Response(hardware.get_available_devices(), mimetype='application/json')


@environment.route('/check', methods=["GET"])
def get_env_info():
    return Response(json.dumps(env.check()), mimetype='application/json')