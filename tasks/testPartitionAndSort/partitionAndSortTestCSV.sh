#!/bin/bash

 cd "$( dirname "$0" )"

../../bin/partitionDataByMonth.sh ../../data/test.csv ./test_output t

for f in ./test_output/*
do
  ../../bin/sortINRIXDataCSV.sh "$f"
  rm -f "$f"
done
