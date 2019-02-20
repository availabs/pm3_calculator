#!/bin/bash

set -e

ETL_WORK_DIR="${1:-"$ETL_WORK_DIR"}"

if [ -z "$ETL_WORK_DIR" ]
then
  echo "USAGE: Specify ETL_WORK_DIR as a env variable or as the 1st cli argument."
  exit 1
fi

ETL_WORK_DIR=$( realpath "${ETL_WORK_DIR}" )

INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION="${3:-"$INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION"}"
INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION="${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION:-".inrix-schema.sorted.csv.gz"}"

find "$ETL_WORK_DIR" -maxdepth 1 -type f -name "*${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION}" -delete
