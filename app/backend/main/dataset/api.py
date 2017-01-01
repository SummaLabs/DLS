#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json

from flask import Blueprint
from flask import request, Response

dataset = Blueprint(__name__, __name__)

from app.backend.core.datasets.dbwatcher import DatasetsWatcher

datasetWatcher = DatasetsWatcher()
datasetWatcher.refreshDatasetsInfo()


@dataset.route('/all/metadata/list', methods=['GET'])
def list_data_sets_metadata():
    metadata_list = json.dumps(datasetWatcher.get_data_sets_metadata())
    return Response(metadata_list, mimetype='application/json')


@dataset.route('/<string:id>/metadata', methods=['GET'])
def data_set_metadata(id):
    metadata = json.dumps(datasetWatcher.get_data_set_metadata(id))
    return Response(metadata, mimetype='application/json')


@dataset.route('/<string:id>/metadata/hists', methods=['GET'])
def ata_set_metadata_hists(id):
    metadata_hists = json.dumps(datasetWatcher.get_data_set_metadata_hists(id))
    return Response(metadata_hists, mimetype='application/json')


@dataset.route('/<string:id>/img/preview', methods=['GET'])
def data_set_img_preview(id):
    try:
        img_data = datasetWatcher.get_data_set_img_preview(id)
    except Exception as err:
        img_data = None
        print (err)
    return img_data


@dataset.route('/<string:id>/img/mean', methods=['GET'])
def data_set_img_mean(id):
    try:
        img_data = datasetWatcher.get_data_set_img_mean(id)
    except Exception as err:
        img_data = None
        print (err)
    return img_data


@dataset.route('/metadata/range', methods=['POST'])
def data_set_metadata_in_range():
    metadata = datasetWatcher.get_data_set_metadata_in_range(request.args['id'],
                                                             request.args['type'],
                                                             request.args['label'],
                                                             int(request.args['from']),
                                                             int(request.args['to']))
    return Response(json.dumps(metadata), mimetype='application/json')