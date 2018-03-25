#!/bin/bash

set -e

if [ -z "$DOWNLOADED_ZIP_PATH" ]
then
  echo "USAGE: Specify DOWNLOADED_ZIP_PATH as a env variable."
  exit 1
fi

if [ -z "$PARTITIONED_INRIX_CSV_PATH_TEMPLATE" ]
then
  echo "USAGE: Specify PARTITIONED_INRIX_CSV_PATH_TEMPLATE as a env variable."
  exit 1
fi

# Using default variables, the TMP_ETL_WORK_DIR
mkdir -p "$(dirname "$PARTITIONED_INRIX_CSV_PATH_TEMPLATE")"

# The data.zip included multiple files. We need the name of the datafile.
# This file name varies.
# The following gets the filename of the largest file in the archive.
DATA_FILE_NAME=$(\
  unzip -Zs "$DOWNLOADED_ZIP_PATH" |\
  tail -n+3 |\
  sed \$d |\
  sort -rn -k4,4 |\
  head -1 |\
  awk '{ print $NF }' \
)

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

awk -F',' \
  -v fpath_template="$PARTITIONED_INRIX_CSV_PATH_TEMPLATE" \
  -f ../partitionDataByMonth.awk \
  <(unzip -p "$DOWNLOADED_ZIP_PATH" "$DATA_FILE_NAME")

popd > /dev/null
