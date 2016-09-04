#!/bin/bash

SRC_DIR=$PWD
DST_DIR=$PWD/../dlscaffe

protoc -I=$SRC_DIR --python_out=$DST_DIR $SRC_DIR/caffedls.proto
