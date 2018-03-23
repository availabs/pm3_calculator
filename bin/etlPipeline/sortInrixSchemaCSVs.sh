#!/bin/bash

set -e

ETL_WORK_DIR="${ETL_WORK_DIR:=$1}"

if [ -z "$ETL_WORK_DIR" ]
then
  echo "USAGE: Specify ETL_WORK_DIR as a env variable."
  exit 1
fi

SORTER_PATH="$( dirname "${BASH_SOURCE[0]}" )/../sortINRIXDataCSV.sh"
SORTER_PATH=$(readlink -f "$SORTER_PATH")

ETL_WORK_DIR=$(readlink -f "${ETL_WORK_DIR}")

pushd "$ETL_WORK_DIR" > /dev/null

ARR=(`find . -regex ".*\.[1-2][0-9][0-1][0-9][0-9][0-9]${INRIX_SCHEMA_CSV_EXTENSION}" | sort`)

for f in "${ARR[@]}"
do
  "$SORTER_PATH" "$f"
done

wait

popd > /dev/null
