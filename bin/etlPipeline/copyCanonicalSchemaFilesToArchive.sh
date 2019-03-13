#!/bin/bash

set -e

ETL_WORK_DIR="${1:-"$ETL_WORK_DIR"}"

if [ -z "$ETL_WORK_DIR" ]
then
  echo "USAGE: Specify ETL_WORK_DIR as a env variable or as the 1st cli argument."
  exit 1
fi

ETL_WORK_DIR=$( realpath "${ETL_WORK_DIR}")

STATE_CANONICAL_SCHEMA_ARCHIVE_DIR="${2:-"$STATE_CANONICAL_SCHEMA_ARCHIVE_DIR"}"

if [ -z "$STATE_CANONICAL_SCHEMA_ARCHIVE_DIR" ]
then
  echo "USAGE: Specify STATE_CANONICAL_SCHEMA_ARCHIVE_DIR as a env variable or as the 2nd cli argument."
  exit 1
fi

mkdir -p "$STATE_CANONICAL_SCHEMA_ARCHIVE_DIR"

STATE_CANONICAL_SCHEMA_ARCHIVE_DIR=$( realpath "${STATE_CANONICAL_SCHEMA_ARCHIVE_DIR}" )

mkdir -p "$STATE_CANONICAL_SCHEMA_ARCHIVE_DIR"

CANONICAL_SCHEMA_CSV_GZ_EXTENSION="${3:-"$CANONICAL_SCHEMA_CSV_GZ_EXTENSION"}"
CANONICAL_SCHEMA_CSV_GZ_EXTENSION="${CANONICAL_SCHEMA_CSV_GZ_EXTENSION:-".npmrds.csv.gz"}"

ETL_OVERWRITE="${4:-"$ETL_OVERWRITE"}"
ETL_OVERWRITE="${ETL_OVERWRITE:-false}"

find "$ETL_WORK_DIR" -type f -name "*${CANONICAL_SCHEMA_CSV_GZ_EXTENSION}" |\
sort |\
while read -r f 
do
  b="$(basename "$f")"
  outf="${STATE_CANONICAL_SCHEMA_ARCHIVE_DIR}/${b}"

  # If the file exists, and the overwrite flag is not true, skip this file
  if [[ -f "$outf" && "${ETL_OVERWRITE}" != true ]]
  then
    echo "Skipping cp of $b to ${STATE_CANONICAL_SCHEMA_ARCHIVE_DIR}"
    echo "  $outf already exists and ETL_OVERWRITE is set to false."
    continue
  fi

  cp "$f" "$outf"
done
