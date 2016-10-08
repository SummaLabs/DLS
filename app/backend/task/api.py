from flask import Response, request

from app.backend.task.task_factory import TaskFactory
from task_manager import TaskManager
from app.backend import config
import flask
import json
import os


task = flask.Blueprint(__name__, __name__)


tm = TaskManager()


# Start new Task.
@task.route('/start', methods=["POST"])
def start_task():
    type = request.args['type']
    params = json.loads(request.args['customParams'])
    task = TaskFactory.create(type, params)
    tm.start_task(task)
    return Response(json.dumps({'taskId': task.id}), mimetype='application/json')

@task.route('/test', methods=["POST"])
def start_test_task():
    task = TaskFactory.create('default', None)
    tm.start_task(task)
    return Response(json.dumps({'taskId': task.id}), mimetype='application/json')

# Kill task
@task.route('/term', methods=["POST"])
def term_task():
    params = json.loads(request.data)
    index = params['index']
    tm.term_task(index)
    return Response(json.dumps("{status: 'ok'}"), mimetype='application/json')


# Get Task's Log
@task.route('/log/<path:task_id>', methods=["GET"])
def get_log(task_id):
    log_file = open(os.path.abspath(config.LOG_DIR_TASK) + "/task_" + task_id + ".log")
    log_text = log_file.read()
    return Response(log_text, mimetype='text/plain')

