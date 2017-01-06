import decimal
import json
import logging
import os

import flask
import keras
import matplotlib.pyplot as plt
import numpy as np
import skimage.transform as sktf
import werkzeug
from flask import request, Response

import config
from app.backend.api import app_flask
from app.backend.core import utils as dlsutils
from app.backend.core.models.cfg import PREFIX_WEIGHT_DIR, PREFIX_WEIGHT_VIS
from app.backend.core.models.flow_parser import DLSDesignerFlowsParser
from app.backend.core.models.keras_trainer_v4 import KerasTrainer as ModelProcessor
from app.backend.core.models.mdlpreview import ModelsWatcher
from app.backend.core.utils import getPathForProjectDir

model = flask.Blueprint(__name__, __name__)

modelsWatcher = ModelsWatcher()
modelsWatcher.refreshModelsInfo()

models_dir = app_flask.config['DLS_MODELS_BASE_PATH']

model_desc_file_name = 'model-description.json'
logger = logging.getLogger("dls")


@model.route('/all/metadata/list', methods=['GET'])
def list_models_metadata():
    metadata = modelsWatcher.getModelsInfoAsList()
    return Response(json.dumps(metadata), mimetype='application/json')


@model.route('/inference/', methods=['POST'])
def model_inference():
    request_data = json.loads(request.data)
    model_id = request_data['modelId']
    images = request_data['images']
    if model_id not in modelsWatcher.dictModelsInfo.keys():
        return Response(json.dumps({'status': 'error: invalid model id'}), mimetype='application/json')

    model_metadata = modelsWatcher.dictModelsInfo[model_id]
    fs_root_path = getPathForProjectDir()
    # (1) create full-paths
    imgs_paths = [os.path.join(fs_root_path, img[1:]) for img in images]
    # (2) filter non-existed files
    imgs_paths = [ip for ip in imgs_paths if os.path.isfile(ip)]
    if len(imgs_paths) < 1:
        return Response(json.dumps({'status': 'error: invalid files paths'}), mimetype='application/json')

    model_processor = ModelProcessor()
    model_processor.loadModelFromTrainingStateInDir(model_metadata.dirModel)
    inference=[]
    try:
        for ip in imgs_paths:
            result = model_processor.inferOneImagePathSorted(ip)
            # Convert probabilities from floats to strings:
            classes_prob = [(xx[0], '%0.3f' % xx[1]) for xx in result['distrib']]
            inference.append({
                'imagePath': ip,
                'classProbabilities': classes_prob
            })
    except Exception as err:
        return Response(json.dumps({'status': 'error: %s' % err}), mimetype='application/json')

    return Response(json.dumps({'status': 'ok', 'data': inference}, cls=DecimalEncoder), mimetype='application/json')


class DecimalEncoder(json.JSONEncoder):
    def _iterencode(self, o, markers=None):
        if isinstance(o, decimal.Decimal):
            # wanted a simple yield str(o) in the next line,
            # but that would mean a yield on the line with super(...),
            # which wouldn't work (see my comment below), so...
            return (str(o) for o in [o])
        return super(DecimalEncoder, self)._iterencode(o, markers)


@model.route('/uploadFile', methods=['POST'])
def upload_file():

    inf_tmp_dir = '/inference_tmp'
    inf_tmp_dir_path = app_flask.config['DLS_FILEMANAGER_BASE_PATH'] + inf_tmp_dir

    if not os.path.exists(inf_tmp_dir_path):
        os.makedirs(inf_tmp_dir_path)

    uploaded = []
    for file in request.files.values():
        print file.filename
        if file.filename :
            filename = werkzeug.utils.secure_filename(file.filename)
            fullname = os.path.join(inf_tmp_dir_path, filename)
            logger.info('uploading file to ' + fullname)
            file.save(fullname)
            uploaded.append( os.path.join(inf_tmp_dir, filename))
    return Response(json.dumps(uploaded), mimetype='application/json')


@model.route('/network/validate', methods=['POST'])
def validate_network():
    if request.method == "POST":
        network = json.loads(request.data)
        result = DLSDesignerFlowsParser.validateJsonFlowAsKerasModel(network)
        return Response(json.dumps(result), mimetype='application/json')

    return Response(json.dumps(('error', 'invalid request')), mimetype='application/json')


@model.route('/<path:model_id>/feature-space/load', methods=['GET'])
def load_feature_space(model_id):
    return Response(json.dumps(modelsWatcher.getFeatureSpace(model_id)), mimetype='application/json')


@model.route('/layers/visualization/<path:model_id>')
def model_layer_visualization(model_id):
    if request.method == "GET":
        model_id = model_id
        if model_id not in modelsWatcher.dictModelsInfo.keys():
            return Response(json.dumps(('error', 'invalid model id [%s]' % model_id)), mimetype='application/json')
        try:
            result = generate_model_layers_weights(modelId=model_id)
        except Exception as err:
            return Response(json.dumps(('error', 'Exception: [%s]' % err)), mimetype='application/json')
        return Response(json.dumps(result), mimetype='application/json')
    return Response(json.dumps(('error', 'invalid request')), mimetype='application/json')


def generate_model_layers_weights(modelId):
    modelInfo = modelsWatcher.dictModelsInfo[modelId]
    # (2) Prepare output directory
    dirBase = modelInfo.dirModel
    dirOut = os.path.join(dirBase, PREFIX_WEIGHT_DIR)
    routeImagePath = os.path.relpath(dirOut, config.BASE_DIR)
    cfgOut = os.path.join(dirOut, PREFIX_WEIGHT_VIS)

    modelProcessor = ModelProcessor()
    modelProcessor.loadModelFromTrainingStateInDir(modelInfo.dirModel)
    # (1) Prepare layers:
    lstLayers = []
    retInfo = []
    for ll in modelProcessor.model.layers:
        tmpInfo = {
            'layerName': ll.name,
            'layerType': '%s' % ll.__class__.__name__,
            'layerShape': '%s' % list(ll.output_shape[1:])
        }
        isAppend = False
        if isinstance(ll, keras.layers.Convolution2D):
            isAppend = True
        elif isinstance(ll, keras.layers.Dense):
            isAppend = True
        if isAppend:
            lstLayers.append(ll)
            tmpInfo['previewPath'] = "%s/%s.jpg" % (routeImagePath, ll.name)
        else:
            tmpInfo['previewPath'] = ""
        retInfo.append(tmpInfo)
    dlsutils.makeDirIfNotExists(dirOut)
    # (3) Export images
    for ii, ll in enumerate(lstLayers):
        print ('[%d] * %s, #params = %d' % (ii, ll.name, ll.count_params()))
        foutImg = '%s/%s.jpg' % (dirOut, ll.name)
        if isinstance(ll, keras.layers.Convolution2D):
            tmp = ll.get_weights()
            dataW = tmp[0]
            dataB = tmp[1]
            numFlt = dataW.shape[0]
            sizx = int(3. * np.sqrt(numFlt) / 4.)
            sizy = int(np.floor(float(numFlt) / sizx))
            tsiz = dataW.shape[-2:]
            cnt = 0
            mapFlt = None
            for xx in range(sizx):
                tmp = None
                for yy in range(sizy):
                    if cnt > numFlt:
                        tflt = np.zeros(tsiz)
                    else:
                        tflt = dataW[cnt].mean(axis=0)
                    tflt = np.pad(tflt, 1, 'constant')
                    if tmp is None:
                        tmp = tflt
                    else:
                        tmp = np.hstack((tmp, tflt))
                    cnt += 1
                if mapFlt is None:
                    mapFlt = tmp
                else:
                    mapFlt = np.vstack((mapFlt, tmp))
            maxShape = max(mapFlt.shape)
            # FIXME: check this point
            if maxShape < 512:
                newShape = np.floor((512. / maxShape) * np.array(mapFlt.shape)).astype(np.int)
                mapFlt = sktf.resize(mapFlt, newShape, order=0)
            # draw image over figure
            plt.imsave(foutImg, mapFlt)
        elif isinstance(ll, keras.layers.Dense):
            tmp = ll.get_weights()
            dataW = tmp[0]
            dataB = tmp[1]
            nr, nc = dataW.shape
            sizMin = min(dataW.shape)
            sizMax = max(dataW.shape)
            koef = float(sizMax) / float(sizMin)
            koefGood = 2. / 4.
            mult = koefGood * koef
            if nr < nc:
                newShape = (int(nr * mult), nc)
            else:
                newShape = (nr, int(nc * mult))
            mapW = sktf.resize(dataW, newShape, order=0)
            if nc < nr:
                mapW = mapW.transpose()
            # draw image over figure
            plt.imsave(foutImg, mapW)
    with open(cfgOut, 'w') as f:
        f.write(json.dumps(retInfo, indent=4))
    return retInfo
