#!/bin/bash

if [ -z "$STATE" ]; then
  echo 'USAGE: specify the STATE by env variable.'
  exit 1
fi

if [ -z "$YEAR" ]; then
  echo 'USAGE: specify the YEAR by env variable.'
  exit 1
fi

cd "$( dirname "$0" )"

cd ../../

mkdir -p data

export STATE
export YEAR

./utils/streamHERESchemaDataForStateYear.sh |\
  ./index.streaming.parallel.js >\
  "data/${STATE}.${YEAR}.pm3-measures.csv"
