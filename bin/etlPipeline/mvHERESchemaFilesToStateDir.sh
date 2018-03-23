#!/bin/bash

set -e

STATE_DIR="${STATE_DIR:=$1}"

if [ -z "$STATE_DIR" ]
then
  echo "USAGE: Specify STATE_DIR as a env variable."
  exit 1
fi

STATE_DIR=$(readlink -f "${STATE_DIR}")


ETL_WORK_DIR="${ETL_WORK_DIR:=$1}"

if [ -z "$ETL_WORK_DIR" ]
then
  echo "USAGE: Specify ETL_WORK_DIR as a env variable."
  exit 1
fi

ETL_WORK_DIR=$(readlink -f "${ETL_WORK_DIR}")

pushd "$ETL_WORK_DIR" > /dev/null

ARR=(`find . -regex ".*${HERE_SCHEMA_CSV_SUFFIX}" | sort`)

for f in "${ARR[@]}"
do
  b="$(basename "$f")"
  outf="${STATE_DIR}/${b}"
  if [ -f "$outf" ]
  then
    echo "Skipping mv of $b to ${STATE_DIR}"
    continue
  fi

  mv "$f" "$outf"
done

popd > /dev/null

