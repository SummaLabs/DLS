#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import json

from flask import Blueprint
from flask import Response

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