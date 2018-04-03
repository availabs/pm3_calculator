#!/bin/bash

set -e

ETL_WORK_DIR="$( readlink -f "${1:-"$ETL_WORK_DIR"}" )"

if [ -z "$ETL_WORK_DIR" ]
then
  echo "USAGE: Specify ETL_WORK_DIR as a env variable."
  exit 1
fi

SORTER_PATH="$( dirname "${BASH_SOURCE[0]}" )/../sortINRIXDataCSV.sh"
SORTER_PATH=$( readlink -f "$SORTER_PATH" )

# Change directory to the work dir
pushd "$ETL_WORK_DIR" > /dev/null

ARR=(`find . -regex ".*\.[1-2][0-9][0-1][0-9][0-9][0-9]${INRIX_SCHEMA_CSV_EXTENSION}" | sort`)

for f in "${ARR[@]}"
do
  outf="${f/${INRIX_SCHEMA_CSV_EXTENSION}/${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION}}"

  if [[ -f "$outf" ]] && [[ "$ETL_OVERWRITE" == false ]]
  then
    echo "File already exists: ${outf}. Skipping..."
    continue
  fi

  # Sort & pipe output through gzip
  "$SORTER_PATH" "$f" | gzip > "$outf"

  # Delete the unsorted csv
  if [ "$ETL_CLEANUP" = true ]
  then
    rm -f "$f"
  fi
done

popd > /dev/null
