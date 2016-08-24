from flask import request
from flask import Response

import json
import os
import stat
import flask
from datetime import datetime

file_manager = flask.Blueprint('file_manager', __name__)

REPOSITORY_BASE_PATH = '/home/leko/FILE_MANAGER'


@file_manager.route('/listUrl', methods=["POST"])
def list_url():
    if request.method == "POST":
        params = json.loads(request.data)
        cur_path = REPOSITORY_BASE_PATH + params['path']
        response_json = {'result': []}
        for path, dirs, files in os.walk(cur_path):
            for name in dirs:
                file_path = os.path.join(path, name)
                print (file_path)
                meta = os.stat(file_path)
                response_json['result'].append({
                    'date': datetime.fromtimestamp(meta.st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
                    'size': meta.st_size,
                    'rights': permissions_to_unix_name(os.stat(file_path)),
                    'name': name,
                    'type': 'dir'
                })

            for name in files:
                file_path = os.path.join(path, name)
                meta = os.stat(file_path)
                response_json['result'].append({
                    'date': datetime.fromtimestamp(meta.st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
                    'size': meta.st_size,
                    'rights': permissions_to_unix_name(os.stat(file_path)),
                    'name': name,
                    'type': 'file'
                })
            del dirs[:]

    return Response(json.dumps(response_json), mimetype='application/json')

def permissions_to_unix_name(st):
    is_dir = 'd' if stat.S_ISDIR(st.st_mode) else '-'
    dic = {'7':'rwx', '6' :'rw-', '5' : 'r-x', '4':'r--', '0': '---'}
    perm = str(oct(st.st_mode)[-3:])
    return is_dir + ''.join(dic.get(x,x) for x in perm)