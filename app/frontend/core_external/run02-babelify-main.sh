#!/bin/bash

./node_modules/.bin/browserify main_lw_layers.js --transform babelify --debug --outfile main_lw_layers-compiled.js
