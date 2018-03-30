#!/bin/bash

set -e

ETL_WORK_DIR="${1:-"$ETL_WORK_DIR"}"

if [ -z "$ETL_WORK_DIR" ]
then
  echo "USAGE: Specify ETL_WORK_DIR as a env variable or as the 1st cli argument."
  exit 1
fi

ETL_WORK_DIR=$(readlink -f "${ETL_WORK_DIR}")

STATE_HERE_SCHEMA_ARCHIVE_DIR="${2:-"$STATE_HERE_SCHEMA_ARCHIVE_DIR"}"

if [ -z "$STATE_HERE_SCHEMA_ARCHIVE_DIR" ]
then
  echo "USAGE: Specify STATE_HERE_SCHEMA_ARCHIVE_DIR as a env variable or as the 2nd cli argument."
  exit 1
fi

STATE_HERE_SCHEMA_ARCHIVE_DIR=$(readlink -f "${STATE_HERE_SCHEMA_ARCHIVE_DIR}")

mkdir -p "$STATE_HERE_SCHEMA_ARCHIVE_DIR"


HERE_SCHEMA_SORTED_CSV_GZ_EXTENSION="${3:-"$HERE_SCHEMA_SORTED_CSV_GZ_EXTENSION"}"
HERE_SCHEMA_SORTED_CSV_GZ_EXTENSION="${HERE_SCHEMA_SORTED_CSV_GZ_EXTENSION:-".here-schema.sorted.csv.gz"}"


ETL_OVERWRITE="${4:-"$ETL_OVERWRITE"}"
ETL_OVERWRITE="${ETL_OVERWRITE:-false}"


find "$ETL_WORK_DIR" -type f -name "*${HERE_SCHEMA_SORTED_CSV_GZ_EXTENSION}" |\
sort |\
while read f 
do
  b="$(basename "$f")"
  outf="${STATE_HERE_SCHEMA_ARCHIVE_DIR}/${b}"

  # If the file exists, and the overwrite flag is not true, skip this file
  if [[ -f "$outf" && "${ETL_OVERWRITE}" != true ]]
  then
    echo "Skipping mv of $b to ${STATE_HERE_SCHEMA_ARCHIVE_DIR}"
    continue
  fi

  mv "$f" "$outf"
done
