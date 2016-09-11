#!/bin/bash

npm install

wdir=`dirname $0`

cd $wdir
python run-app.py

