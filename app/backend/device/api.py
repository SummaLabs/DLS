from flask import Response

import json
import flask

device = flask.Blueprint(__name__, __name__)

@device.route('/info', methods=["GET"])
def get_system_info():

    #Generating JSON for test
    memInfo = {'total': '16343208', 'used': '14052296', 'free': '2290912', 'shared': '1178876', 'buffer': '716900', 'cached': '5522532'}
    gpuInfo = [{'id': 'gtx970', 'name': 'gtx970', 'mem': '1024'}, {'id': 'gtx980', 'name': 'gtx980', 'mem': '2048'}]
    info = {}
    info['mem'] = memInfo
    info['gpu'] = gpuInfo
    info['gpuSelected'] = 'gtx970'
    return Response(json.dumps(info), mimetype='application/json')