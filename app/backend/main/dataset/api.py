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


@dataset.route('/all/metadata/list/', methods=['GET'])
def list_metadata():
    metadata_list = json.dumps(datasetWatcher.getDatasetsInfoStatList())
    return Response(metadata_list, mimetype='application/json')
