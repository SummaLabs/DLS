#!/bin/bash

./node_modules/.bin/browserify main.js --transform babelify --debug --outfile main-compiled.js
