#!/bin/bash

dirRoot="$PWD/.."
wdir="$PWD/../app/backend-test/core_models"
runpy="run04_build_model_train_task.py"

export PYTHONPATH="${dirRoot}:${PYTHONPATH}"

pushd $wdir
python $runpy
popd


