from flask import Response, request
from task_manager import TaskManager
from default_task import DefaultTask, CmdTask
import flask
import json


task = flask.Blueprint(__name__, __name__)


tm = TaskManager()


@task.route('/start', methods=["POST"])
def start_task():
    params = json.loads(request.data)
    t = DefaultTask()
    tm.start_task(t)
    return Response(json.dumps("{status: 'ok'}"), mimetype='application/json')


@task.route('/term', methods=["POST"])
def term_task():
    params = json.loads(request.data)
    index = params['index']
    tm.term_task(index)
    return Response(json.dumps("{status: 'ok'}"), mimetype='application/json')

