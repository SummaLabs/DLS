#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import skimage.io as skio
import numpy as np
import h5py

############################
from run00_common import ImageDirParser

############################
if __name__ == '__main__':
    wdir = '../../dataset-image2d/simple4c_test'
    imgDirParser = ImageDirParser(wdir=wdir)
    print (imgDirParser)
    #
    pathH5File = 'test-dataset.h5'
    f=h5py.File(pathH5File, 'w')
    f.create_dataset('scheme', data=np.array(imgDirParser.scheme))
    grpData = f.create_group('data')
    for ii,dataRow in enumerate(imgDirParser):
        print ('[%d] : %s' % (ii, dataRow[0]))
        grpName = 'row_%08d' % ii
        grp = grpData.create_group(grpName)
        for vvi, vv in enumerate(dataRow):
            ttype = imgDirParser.scheme[vvi]
            tkey = 'col_%02d' % vvi
            if ttype == 'path-img2d':
                timg = skio.imread(vv)
                dset = grp.create_dataset(tkey, data=timg)
            elif ttype == 'category-idx':
                dset = grp.create_dataset(tkey, data=np.array(vv))
            elif ttype == 'array-float':
                dset = grp.create_dataset(tkey, data=vv)
            elif ttype == 'category-name':
                dset = grp.create_dataset(tkey, data=np.array(vv))
            else:
                raise Exception('Unknown feature type [%s]' % ttype)
    f.close()