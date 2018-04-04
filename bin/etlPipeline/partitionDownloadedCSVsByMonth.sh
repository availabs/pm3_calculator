#!/bin/bash

set -e

PARTITIONED_INRIX_CSV_PATH_TEMPLATE="${1:-$PARTITIONED_INRIX_CSV_PATH_TEMPLATE}"
PARTITIONED_INRIX_CSV_PATH_TEMPLATE="${PARTITIONED_INRIX_CSV_PATH_TEMPLATE:=__MONTH__.inrix-schema.csv}"
PARTITIONED_INRIX_CSV_PATH_TEMPLATE="$(readlink -m "${PARTITIONED_INRIX_CSV_PATH_TEMPLATE}")"

# Get the path of the AWK partitioner script
PARTITIONER_PATH="$(readlink -e "$( dirname "${BASH_SOURCE[0]}" )/../partitionDataByMonth.awk")"

# Using default variables, the ARCHIVE_PATHS
DDIR="$(dirname "$PARTITIONED_INRIX_CSV_PATH_TEMPLATE")"

mkdir -p "$DDIR"

# Move the the output dir of the partitioned files
#   This removes the risk of the __MONTH__ placeholder
#   ever being part of the file's path.
pushd "$DDIR" > /dev/null

# Partition the CSV read from STDIN
awk -F',' \
  -v fpath_template="$(basename "$PARTITIONED_INRIX_CSV_PATH_TEMPLATE")" \
  -f "$PARTITIONER_PATH" \
  -

popd > /dev/null
