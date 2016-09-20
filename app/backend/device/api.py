from flask import Response
import flask
from app.backend.device import device


device = flask.Blueprint(__name__, __name__)


@device.route('/info', methods=["GET"])
def get_system_info():

    return Response(device.generate_system_info(), mimetype='application/json')



