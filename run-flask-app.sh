#!/bin/bash

wdir=`dirname $0`

cd $wdir

JUPYTER_CONFIG_DIR="/home/sergo/Work/Gitlab/DLS/devops/jupyter"

jupyter-notebook

python run-app.py

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

