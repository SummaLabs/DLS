from flask import Response, request
import flask
import json


task = flask.Blueprint(__name__, __name__)


@task.route('/start', methods=["POST"])
def start_task():
    params = json.loads(request.data)
    return Response(json.dumps("{status: 'ok'}"), mimetype='application/json')


@task.route('/term', methods=["POST"])
def term_task():
    params = json.loads(request.data)
    return Response(json.dumps("{status: 'ok'}"), mimetype='application/json')

