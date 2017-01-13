#!/bin/bash

wdir=`dirname $0`

cd $wdir

output=$(~/.local/bin/jupyter-notebook &> jupiter.log &)

echo $output

python run-app.py

