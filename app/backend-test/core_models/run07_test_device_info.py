#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

import app.backend.device.device as dlsdev

if __name__ == '__main__':
    tinfo = dlsdev.get_available_devices_list()
    print (tinfo)