#!/bin/bash

dirRoot="$PWD/.."
wdir="$PWD/../app/backend-test/core_convertors"
runpy="run02_test_kerasModel2DLS.py"

export PYTHONPATH="${dirRoot}:${PYTHONPATH}"

pushd $wdir
python $runpy
popd

