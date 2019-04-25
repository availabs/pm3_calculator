#!/bin/bash

set -e

. ./setDefaultVariables.sh

ETL_WORK_DIR="${1:-"$ETL_WORK_DIR"}"

if [ -z "$ETL_WORK_DIR" ]
then
  echo "USAGE: Specify ETL_WORK_DIR as a env variable."
  exit 1
fi

TRANSFORMER_PATH="$( dirname "${BASH_SOURCE[0]}" )/../transformINRIXToCanonicalSchema.js"
TRANSFORMER_PATH=$(readlink -f "$TRANSFORMER_PATH")

ETL_WORK_DIR=$(readlink -f "${ETL_WORK_DIR}")

pushd "$ETL_WORK_DIR" > /dev/null

ARR=(`find -L . -regex ".*\.[1-2][0-9][0-1][0-9][0-9][0-9]${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION}" | sort`)

for f in "${ARR[@]}"
do
  outf="${f/${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION}/${CANONICAL_SCHEMA_CSV_GZ_EXTENSION}}"

  zcat "$f" | "$TRANSFORMER_PATH" | gzip > "$outf"
done

popd > /dev/null
