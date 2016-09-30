#!/bin/bash

for ii in `ls -1 *.prototxt-old`
do
    bn=${ii::-13}
    finpProto="${ii}"
    finpWeights="${bn}.caffemodel-old"
    foutProto="${bn}.prototxt"
    foutWeights="${bn}.caffemodel"
    echo "INP: proto/weights = ${finpProto}/${finpWeights}  *  OUT: ${foutProto}/${foutWeights}"

    if [ -f "$finpProto" ]; then
	echo -e "\tconvert [$finpProto] --> [$foutProto]"
	./upgrade_net_proto_text $finpProto $foutProto
    fi

    if [ -f "$finpWeights" ]; then
	echo -e "\tconvert [$finpWeights] --> [$foutWeights]"
	./upgrade_net_proto_binary $finpWeights $foutWeights
    fi
done