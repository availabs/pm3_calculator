#!/bin/bash

if [ -z "$STATE" ]; then
  echo 'USAGE: specify the STATE by env variable.'
  exit 1
fi

if [ -z "$YEAR" ]; then
  echo 'USAGE: specify the YEAR by env variable.'
  exit 1
fi

DATA_DIR=$(readlink -f "$( dirname "$0" )/../etl/${STATE}")
OUT_DIR="${OUT_DIR:="${DATA_DIR}"}"

mkdir -p "${OUT_DIR}"

# Convert to absolute path so we can cd into the DATA_DIR
OUT_DIR=$(readlink -f "${OUT_DIR}")

cd "${DATA_DIR}"

ARR=(`find . -regex ".*${STATE}.${YEAR}[0-1][0-9].here-schema.sorted.csv" | sort`)

export GZIP=-9
for f in "${ARR[@]}"
do
  b=$(basename "$f")
  outf="$(readlink -f "${OUT_DIR}")/${b}.tar.gz"

  if [ -f "$outf" ]
  then
    echo "Output file exists... skipping $outf"
    continue
  fi

  tar zcvf "${OUT_DIR}/${b}.tar.gz" "${b}"
done
