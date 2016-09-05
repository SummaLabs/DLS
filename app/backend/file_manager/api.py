from flask import request
from flask import Response

import json
import os
import flask

file_manager = flask.Blueprint('file_manager', __name__)

REPOSITORY_BASE_PATH = '/home/galeko/FILE_MANAGER/'


@file_manager.route('/listUrl', methods=["POST"])
def list_url():
    if request.method == "POST":
        print request.data
        params = json.loads(request.data)
        print os.walk(params['path'])

        cur_path = REPOSITORY_BASE_PATH + params['path']
        for path, dirs, files in os.walk(cur_path):
            for name in files:
                file_path = os.path.join(path, name)
                meta = os.stat(file_path)
                size = meta.st_size
                print name, size
            del dirs[:]

    return Response('', mimetype='application/json')