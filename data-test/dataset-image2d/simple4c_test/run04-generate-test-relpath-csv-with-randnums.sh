#!/bin/bash

fpathRnd='idx-all-relpath-rnd.csv'
numRND=5
##sep=','
sep='|'

##fout='test-csv-v1.csv'
fout='test-csv-v2.csv'
:>$fout

###################################
thdr="path${sep}label"
for ii in `seq 1 ${numRND}`
do
    thdr="${thdr}${sep}val_${ii}"
done
thdr="${thdr}${sep}label_long"

echo "${thdr}" | tee -a ${fout}

###################################
##cat $fpathRnd | head -n 10 | while read ll
cat $fpathRnd | while read ll
do
    tpth=`echo ${ll} | cut -d\, -f1`
    tlbl=`echo ${ll} | cut -d\, -f2`
    tstr=`echo -e "${tpth}${sep}\t${tlbl}${sep}\t"`
    for ii in `seq 1 ${numRND}`
    do
	tstr="${tstr}${RANDOM}${sep}"
    done
    tstr="${tstr}  label_${tlbl}"
    echo "${tstr}" | tee -a ${fout}
done
