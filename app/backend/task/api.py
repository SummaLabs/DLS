from flask import Response, request
from task_manager import TaskManager
from default_task import DefaultTask, CmdTask
from config import DevelopmentConfig
import flask
import json
import os


task = flask.Blueprint(__name__, __name__)

app_config = DevelopmentConfig()
tm = TaskManager()


# Start new Task. This is for testing only so no params
@task.route('/start', methods=["POST"])
def start_task():
    params = json.loads(request.data)
    t = DefaultTask(app_config) #CmdTask("/home/yegor/trash/DLS/app/backend/task/test.sh")
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


# Get Task's Log
@task.route('/log/<path:task_id>', methods=["GET"])
def get_log(task_id):
    log_file = open(os.path.abspath(app_config.LOG_DIR_TASK) + "/task_" + task_id + ".log")
    log_text = log_file.read()
    return Response(log_text, mimetype='text/plain')

