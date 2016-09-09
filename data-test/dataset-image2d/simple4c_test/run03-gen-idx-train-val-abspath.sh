#!/bin/bash

fabs='idx-all-abspath.csv'
fabsRnd='idx-all-abspath-rnd.csv'
fabsTrain='idx-all-abspath-train.csv'
fabsVal='idx-all-abspath-val.csv'

numAll=`cat $fabs | wc -l`
pval=20
((numVal=numAll*20/100))
((numTrain=numAll-numVal))

echo "Tot: $numAll, Train: $numTrain, Val: $numVal"
cat $fabs | shuf > $fabsRnd

# (1) Train
cat $fabsRnd | head -n $numTrain > $fabsTrain
# (2) Validation
cat $fabsRnd | tail -n $numVal > $fabsVal
