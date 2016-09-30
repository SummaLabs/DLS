from zipfile import ZipFile

from flask import request
from flask import Response

import json
import os
import shutil
import stat
import flask
import werkzeug
import logging
from datetime import datetime
from app.backend.api import app_flask


file_manager = flask.Blueprint('file_manager', __name__)
logger = logging.getLogger("dls")
# REPOSITORY_BASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../data-test')
REPOSITORY_BASE_PATH = app_flask.config['DLS_FILEMANAGER_BASE_PATH']
ONLY_FOLDERS = False
ALLOWED_EXTENSIONS = app_flask.config['ALLOWED_EXTENSIONS']

print ('::DLS_FILEMANAGER_BASE_PATH --> %s' % REPOSITORY_BASE_PATH)


def getRealPathFromFMUrlPath(urlPath):
    """
    getRealPathFromFMUrlPath()
    :param urlPath: path returned FM on Frontend
    :return: local absolute path on server FileSystem
    """
    tret = os.path.join(REPOSITORY_BASE_PATH, urlPath)
    return tret

def validateSeverPathFromUrlPath(urlPath):
    """
    validateSeverPathFromUrlPath()
    :param urlPath:
    :return: (isDirectory, isFile)
    """
    tpath  = getRealPathFromFMUrlPath(urlPath)
    isDir  = os.path.isdir(tpath)
    isfile = os.path.isfile(tpath)
    return (isDir, isfile)

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


@file_manager.route('/downloadFileUrl', methods=["GET"])
def download_file_url():
    path = request.args.get('path')
    return flask.send_file(REPOSITORY_BASE_PATH + path,  mimetype='image/gif')


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


@file_manager.route('/uploadUrl', methods=['POST'])
def upload_file():

    dest = request.form['destination']
    print dest
    for file in request.files.values():
        print file.filename
        if file.filename and allowed_file(file.filename):
            filename = werkzeug.utils.secure_filename(file.filename)
            fullname = os.path.join(REPOSITORY_BASE_PATH + dest, filename)
            logger.info('uploading file to ' + fullname)
            file.save(fullname)
    return Response(json.dumps({}), mimetype='application/json')


@file_manager.route('/unzip', methods=['POST'])
def unzip():

    params = json.loads(request.data)
    filename = params['filename']
    path = REPOSITORY_BASE_PATH + '/' + params['path']
    logger.info(" unzipping file " + REPOSITORY_BASE_PATH + filename + " to " + path)
    zip = ZipFile(REPOSITORY_BASE_PATH + "/" + filename)
    zip.extractall(path=path)
    return Response(json.dumps({}), mimetype='application/json')


@file_manager.route('/getContentUrl', methods=['POST'])
def get_content_url():

    params = json.loads(request.data)
    filename = params['item']
    path = REPOSITORY_BASE_PATH + filename
    logger.info("reading file " + path)
    f = open(path, 'r')
    content = f.read()
    return Response(json.dumps({'result': content}), mimetype='application/json')


@file_manager.route('/editUrl', methods=['POST'])
def edit_url():

    params = json.loads(request.data)
    filename = params['item']
    content = params['content']
    path = REPOSITORY_BASE_PATH + filename
    logger.info("updating file " + path)
    f = open(path, 'w')
    f.write(content)
    f.truncate()
    f.close()
    return Response(json.dumps({}), mimetype='application/json')





