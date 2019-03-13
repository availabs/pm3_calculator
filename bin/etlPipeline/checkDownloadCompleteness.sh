#!/bin/bash

set -e

ETL_WORK_DIR="${1:-"$ETL_WORK_DIR"}"
if [ -z "$ETL_WORK_DIR" ]
then
  echo "USAGE: Specify ETL_WORK_DIR as a env variable or as the 1st cli arg"
  exit 1
fi

ETL_WORK_DIR="$( realpath "$ETL_WORK_DIR" )"

INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION="${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION:=.inrix-schema.sorted.csv.gz}"

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

CHECKER=../npmrdsMonthDownloadCompletenessChecker.js

set +e
DATA_GAPS_LOG="$(
  find "$ETL_WORK_DIR" -type f -name "*${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION}" |
    sort |
    while read -r inf 
    do
      zcat "$inf" | node "$CHECKER"
    done
)"

popd > /dev/null

set -e

if [ ! -z "$DATA_GAPS_LOG" ]; then
  echo "DATA GAP FOUND"
  echo "$DATA_GAPS_LOG" > "${ETL_WORK_DIR}/data_gaps_log.ndjson"
  exit 1
else
  echo "NO DATA GAP"
fi

