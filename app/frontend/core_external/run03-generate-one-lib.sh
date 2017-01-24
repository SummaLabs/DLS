#!/bin/bash

foutModule='code-lib-all.js'

str="./models/lightweight_layers/layers_basic.js
./models/lightweight_layers/layers_pooling.js
./models/lightweight_layers/layers_convolutional.js
./models/toposort.js
./models/network_lib.js
"

echo ":::: generating [${foutModule}]"
:> $foutModule

for ii in `echo $str`
do
##    echo "> $ii"
    cat "${ii}"
done >> ${foutModule}

