#!/bin/bash

# percent of validation part od dataset
pval=20
lstDirs="dataset-image2d/simple4c_test dataset-image2d-cat-vs-dogs-resizx4 dataset-image2d-mnist-small-10k"

##########################################
function get_fn_list() {
    twdir="$1"
    for ii in `ls -1d ${twdir}/*/`
    do
	cls=`basename $ii`
	ls -1 ${twdir}/${cls}/* | sed "s/$/\,${cls}/"
    done
}

function generate_idx_csv() {
    twdir="$1"
    # (1) precaltulcate number of files
    tnum=`get_fn_list $twdir | wc -l`
    ((tnumVal=tnum*pval/100))
    ((tnumTrain=tnum-tnumVal))
    # (2) prepare output names
    bn=`basename $twdir`
    bnOut="idx-${bn}"
    foutAll="${bnOut}-all.csv"
    foutTrain="${bnOut}-train.csv"
    foutVal="${bnOut}-val.csv"
    # (3) save csv
    get_fn_list $twdir | shuf > $foutAll
    cat $foutAll | head -n $tnumTrain > $foutTrain
    cat $foutAll | tail -n $tnumVal   > $foutVal
}

##########################################
for ii in `echo $lstDirs`
do
    echo ":: ${ii}"
    generate_idx_csv $ii
done
