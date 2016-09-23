from flask import Response, request
from task_manager import TaskManager
from default_task import DefaultTask, CmdTask
import flask
import json


task = flask.Blueprint(__name__, __name__)


tm = TaskManager()


# Start new Task. This is for testing only so no params
@task.route('/start', methods=["POST"])
def start_task():
    params = json.loads(request.data)
    t = DefaultTask() #CmdTask("/home/yegor/trash/DLS/app/backend/task/test.sh")
    # t = CmdTask("/home/yegor/trash/DLS/app/backend/task/test.sh")
    tm.start_task(t)
    return Response(json.dumps("{status: 'ok'}"), mimetype='application/json')


# Kill task
@task.route('/term', methods=["POST"])
def term_task():
    params = json.loads(request.data)
    index = params['index']
    tm.term_task(index)
    return Response(json.dumps("{status: 'ok'}"), mimetype='application/json')

