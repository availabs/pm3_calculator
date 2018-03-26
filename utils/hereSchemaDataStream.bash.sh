#!/bin/bash

if [ -z "$STATE" ]; then
  echo 'USAGE: specify the STATE by env variable.'
  exit 1
fi

if [ -z "$YEAR" ]; then
  echo 'USAGE: specify the YEAR by env variable.'
  exit 1
fi

# Specified as first command line arg, or defaults to STATE dir
DATA_DIR="$(readlink -f ${1:-"$( dirname "$0" )/../etl/${STATE}"})"

pushd "$DATA_DIR" > /dev/null

ARR=(`find "${DATA_DIR}" -regex ".*${STATE}.${YEAR}[0-1][0-9].here-schema.sorted.csv" | sort`)

head -1 "${ARR[1]}";
for f in "${ARR[@]}"; do tail -n+2 "$f"; done | LC_ALL=C sort

popd > /dev/null

