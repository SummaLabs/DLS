#!/bin/bash

fout='idx-all-relpath.csv'

:>$fout
for ll in `ls -1d */ | sed 's/\///g'`
do
    echo ":: append label [$ll]"
    for ii in `ls -1 ${ll}/*.jpg`
    do
	echo "${ii},${ll}" >> $fout
    done
done
