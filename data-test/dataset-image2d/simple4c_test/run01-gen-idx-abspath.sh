#!/bin/bash

fout='idx-all-abspath.csv'

:>$fout
for ll in `ls -1d */ | sed 's/\///g'`
do
    echo ":: append label [$ll]"
    for ii in `ls -1 $PWD/${ll}/*.jpg`
    do
	echo "${ii},${ll}" >> $fout
    done
done
