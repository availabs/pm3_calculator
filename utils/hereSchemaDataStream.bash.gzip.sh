#!/bin/bash

# Specified as first command line arg, or defaults to STATE dir
DATA_DIR="$(readlink -f "${1:="$DATA_DIR"}")"

if [ -z "$DATA_DIR" ]; then
  echo 'USAGE: specify the DATA_DIR by env variable.'
  exit 1
fi

YEAR="${2:="$YEAR"}"

if [ -z "$YEAR" ]; then
  echo 'USAGE: specify the YEAR by env variable.'
  exit 1
fi

pushd "$DATA_DIR" > /dev/null

ARR=(`find "${DATA_DIR}" -regex ".*${YEAR}[0-1][0-9].here-schema.sorted.csv.gz" | sort`)
 
zcat "${ARR[1]}" | head -1;
for f in "${ARR[@]}"; do zcat "$f" | tail -n+2; done | LC_ALL=C sort

popd > /dev/null

