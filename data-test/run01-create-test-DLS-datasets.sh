#!/bin/bash

dirRoot="$PWD/.."
wdir="$PWD/../app/backend-test/core_datasets"
runpy="run01_create_dataset_from_config_v2.py"

export PYTHONPATH="${dirRoot}:${PYTHONPATH}"

pushd $wdir
python $runpy
popd


