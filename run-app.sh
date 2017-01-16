#!/bin/bash

wdir=`dirname $0`

cd $wdir

export JUPYTER_CONFIG_DIR=$PWD/devops/jupyter

export PYTHONPATH=$PYTHONPATH:$PWD/app/backend

jupyter-notebook &>jupyter.log &

python run-app.py

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

