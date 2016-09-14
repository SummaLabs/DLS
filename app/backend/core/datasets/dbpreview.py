import os
import sys
import glob

from flask import Flask, Blueprint
from flask import request, Response, make_response
from flask import render_template
from flask import send_from_directory

from app.backend.file_manager.api import getRealPathFromFMUrlPath, validateSeverPathFromUrlPath

import json
import time

dbpreview = Blueprint(__name__, __name__)

###############################
class Dataset:
    wdir=None
    mapUrl=None
    def __init__(self, pathRoot):
        if not os.path.isdir(pathRoot):
            strError = 'Cant find directory [%s]' % pathRoot
            print (strError)
            self.mapUrl = {}
            return
            # raise Exception()
        self.wdir = os.path.abspath(pathRoot)
        tlstDir=[os.path.basename(xx) for xx in glob.glob('%s/*' % self.wdir) if os.path.isdir(xx)]
        self.mapUrl = {}
        for dd in tlstDir:
            tmp = [ {'pos': ii, 'info' : dd, 'idx': '%s/%s' % (dd,os.path.basename(xx))} for ii,xx in enumerate(glob.glob('%s/%s/*.jpg' % (self.wdir,dd)))]
            self.mapUrl[dd] = tmp
        tmpApp = []
        for vv in self.mapUrl.values():
            tmpApp += vv
        self.mapUrl['all'] = tmpApp
        for ii,vv in enumerate(self.mapUrl.values()):
            print ('%d : %s' % (ii, vv[0]))
    def getInfo(self):
        tret={}
        for kk,vv in self.mapUrl.items():
            tret[kk] = len(vv)
        return tret
    def getImageSrcFromDataset(self, imgIdx):
        tpath = os.path.join(self.wdir, imgIdx)
        if not os.path.isfile(tpath):
            raise Exception('Cant find image [%s]' % tpath)
        with open(tpath, 'rb') as f:
            return f.read()

###############################
dataSetProvider = Dataset(os.path.abspath('data-test/dataset-image2d/simple4c_test'))

###############################
@dbpreview.route('/datasetinfo/', methods=['GET', 'POST'])
def dataset_info():
    jsonData = json.dumps(dataSetProvider.getInfo())
    return Response(jsonData, mimetype='application/json')

@dbpreview.route('/datasetrange/', methods=['GET', 'POST'])
def dataset_range():
    dbid  = request.args['dbid']
    tfrom = int(request.args['from'])
    tto   = int(request.args['to'])
    tmp   = dataSetProvider.mapUrl[dbid]
    tret  = []
    for xx in range(tfrom,tto):
        tret.append(tmp[xx])
    return Response(json.dumps(tret), mimetype='application/json')

@dbpreview.route('/getimgdata/<path:imageid>')
def get_image_data(imageid):
    try:
        tdata = dataSetProvider.getImageSrcFromDataset(imageid)
    except Exception as err:
        tdata = None
        print (err)
    return tdata

###############################
@dbpreview.route('/getserverpath/<path:ppath>', methods=['GET', 'POST'])
def get_server_path(ppath):
    return getRealPathFromFMUrlPath(ppath)

@dbpreview.route('/checkpath/<path:ppath>', methods=['GET', 'POST'])
def check_server_path(ppath):
    tmp = validateSeverPathFromUrlPath(ppath)
    tret = {
        'isdir':  tmp[0],
        'isfile': tmp[1]
    }
    return Response(json.dumps(tret), mimetype='application/json')

###############################
if __name__ == '__main__':
    pass
