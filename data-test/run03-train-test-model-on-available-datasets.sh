#!/bin/bash

dirRoot="$PWD/.."
wdir="$PWD/../app/backend-test/core_models"
runpy="run05_test_train_model.py"

export PYTHONPATH="${dirRoot}:${PYTHONPATH}"

pushd $wdir
python $runpy
popd


