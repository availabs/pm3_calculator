#!/bin/bash

set -e

DOWNLOADED_ZIP_PATH="$(readlink -m "${1:-$DOWNLOADED_ZIP_PATH}")"

PARTITIONED_INRIX_CSV_PATH_TEMPLATE="$(readlink -m "${2:-$PARTITIONED_INRIX_CSV_PATH_TEMPLATE}")"

if [ -z "$DOWNLOADED_ZIP_PATH" ]
then
  echo "USAGE: Specify DOWNLOADED_ZIP_PATH as a env variable or as the 1st cli arg."
  exit 1
fi

if [ ! -f "$DOWNLOADED_ZIP_PATH" ]
then
  echo "$DOWNLOADED_ZIP_PATH does not exist"
  exit 1
fi

if [ -z "$PARTITIONED_INRIX_CSV_PATH_TEMPLATE" ]
then
  echo "USAGE: Specify PARTITIONED_INRIX_CSV_PATH_TEMPLATE as a env variable or as the 2nd cli arg."
  exit 1
fi

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

PARTITIONER_PATH="$(readlink -e '../partitionDataByMonth.awk')"

popd > /dev/null

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

# Using default variables, the TMP_ETL_WORK_DIR
DDIR="$(dirname "$PARTITIONED_INRIX_CSV_PATH_TEMPLATE")"

mkdir -p "$DDIR"

# Move the the output dir of the partitioned files
#   This removes the risk of the __MONTH__ placeholder
#   ever being part of the file's path.
pushd "$DDIR" > /dev/null

awk -F',' \
  -v fpath_template="$(basename "$PARTITIONED_INRIX_CSV_PATH_TEMPLATE")" \
  -f "$PARTITIONER_PATH" \
  <(unzip -p "$DOWNLOADED_ZIP_PATH" "$DATA_FILE_NAME")

popd > /dev/null
