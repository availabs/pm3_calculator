#!/bin/bash

# 1st cli arg, or env, or 5
CONCURRENCY=${CONCURRENCY:=5}
CONCURRENCY=${1:-$CONCURRENCY}

pushd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null


COUNTER=0

../../bin/getPM3ColumnsFromDB.sh > ../../utils/pm3OutputCols.json

while [  $COUNTER -lt "$CONCURRENCY" ]; do
  ./doIt.sh &
  let COUNTER=COUNTER+1 
done

wait

popd >/dev/null
