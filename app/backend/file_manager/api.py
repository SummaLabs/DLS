from flask import request
from flask import Response

import json
import os
import shutil
import stat
import flask
from datetime import datetime
from app.backend.api import app_flask

file_manager = flask.Blueprint('file_manager', __name__)

# REPOSITORY_BASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../data-test')
REPOSITORY_BASE_PATH = app_flask.config['DLS_FILEMANAGER_BASE_PATH']
ONLY_FOLDERS = False

print ('--> %s' % REPOSITORY_BASE_PATH)

@file_manager.route('/listUrl', methods=["POST"])
def list():
    if request.method == "POST":
        params = json.loads(request.data)
        cur_path = REPOSITORY_BASE_PATH + params['path']

        response_json = {'result': []}
        for path, dirs, files in os.walk(cur_path):
            for name in dirs:
                file_path = os.path.join(path, name)
                response_json['result'].append(get_file_info(name, file_path))
            if not ONLY_FOLDERS:
                for name in files:
                    file_path = os.path.join(path, name)
                    response_json['result'].append(get_file_info(name, file_path))

            del dirs[:]

    return Response(json.dumps(response_json), mimetype='application/json')


@file_manager.route('/renameUrl', methods=["POST"])
def rename():
    params = json.loads(request.data)
    response_json = {'result': []}

    src_name = REPOSITORY_BASE_PATH + params['item']
    dst_name = REPOSITORY_BASE_PATH + params['newItemPath']



    try:
        os.rename(src_name, dst_name)
        response_json['result'].append({
            'success': 'true'
        })
    except OSError as exception:
        error_message = "Error({0}): {1}".format(exception.errno, exception.strerror)

        response_json['result'].append({
            'success': 'false',
            'error': error_message
        })

    return Response(json.dumps(response_json), mimetype='application/json')


@file_manager.route('/moveUrl', methods=["POST"])
def move():
    params = json.loads(request.data)
    response_json = {'result': []}

    src_items = params['items']
    dst_path = REPOSITORY_BASE_PATH + params['newPath']

    try:
        for src in src_items:
            shutil.move(src, dst_path)

        response_json['result'].append({
            'success': 'true'
        })
    except:
        error_message = "Could not move files to {0}".format(dst_path)

        response_json['result'].append({
            'success': 'false',
            'error': error_message
        })

    return Response(json.dumps(response_json), mimetype='application/json')


@file_manager.route('/removeUrl', methods=["POST"])
def remove():
    params = json.loads(request.data)
    response_json = {'result': []}

    items = params['items']
    try:
        for item in items:
            full_path = REPOSITORY_BASE_PATH + item
            meta = os.stat(full_path)

            if stat.S_ISDIR(meta.st_mode):
                shutil.rmtree(full_path)
            else:
                os.remove(full_path)

        response_json['result'].append({
            'success': 'true'
        })
    except:
        error_message = "Could not remove files!"
        print (error_message)
        response_json['result'].append({
            'success': 'false',
            'error': error_message
        })

    return Response(json.dumps(response_json), mimetype='application/json')


@file_manager.route('/createFolderUrl', methods=["POST"])
def create_folder():
    params = json.loads(request.data)
    new_dir = REPOSITORY_BASE_PATH + params['newPath']

    response_json = {'result': []}

    try:
        os.makedirs(new_dir)
        response_json['result'].append({
            'success': 'true'
        })
    except OSError as exception:
        error_message = "Error({0}): {1}".format(exception.errno, exception.strerror)

        if not os.path.isdir(new_dir):
            error_message = "target 'dirname' is not a directory: " + new_dir
        response_json['result'].append({
            'success': 'false',
            'error': error_message
        })

    return Response(json.dumps(response_json), mimetype='application/json')


def get_file_info(file_name, file_path):
    meta = os.stat(file_path)

    file_info = {
        'date': datetime.fromtimestamp(meta.st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
        'size': meta.st_size if not stat.S_ISDIR(meta.st_mode) else '',
        'rights': permissions_to_unix_name(os.stat(file_path)), 'name': file_name,
        'type': 'dir' if stat.S_ISDIR(meta.st_mode) else 'file'
    }

    return file_info


def permissions_to_unix_name(st):
    is_dir = 'd' if stat.S_ISDIR(st.st_mode) else '-'
    dic = {'7':'rwx', '6' :'rw-', '5' : 'r-x', '4':'r--', '0': '---'}
    perm = str(oct(st.st_mode)[-3:])
    return is_dir + ''.join(dic.get(x,x) for x in perm)