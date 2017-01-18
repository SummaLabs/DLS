#!/bin/bash

##npm init -y
npm install babel-cli babel-core babel-preset-es2015 browserify watchify babelify --save-dev

echo "
{
  \"presets\": [\"es2015\"]
}
" > .babelrc
