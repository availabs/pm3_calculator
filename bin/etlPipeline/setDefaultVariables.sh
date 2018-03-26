#!/bin/bash

set -e

if [ -z "${STATE}" ]
then
  echo "USAGE: Specify STATE as a env variable."
  exit 1
fi

# To lowercase
STATE=${STATE,,}

# Use highest compression level when creating archives
GZIP=-9

# If env var ETL_UUID not set, create uuid
ETL_UUID="${ETL_UUID:="$(uuidgen)"}"

# Overwrite existing files (NOT YET IMLEMENTED)
ETL_OVERWRITE="${ETL_OVERWRITE:=true}"

# Move output files to archive directory (NOT YET IMLEMENTED)
ETL_ARCHIVE="${ETL_ARCHIVE:=true}"

# Delete intermediate files
ETL_CLEANUP="${ETL_CLEANUP:=true}"

# Dir of this script so we can use relative paths
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

STATE_DIR="$(\
  readlink -m "${STATE_DIR:="$(readlink -f "${DIR}/../../etl/${STATE}/")"}" \
)"

ETL_WORK_DIR="$(\
  readlink -m "${ETL_WORK_DIR:="${STATE_DIR}/${STATE}.${ETL_UUID}.etl-work-dir"}" \
)"

ARCHIVE_DIR="$(\
  readlink -m "${ARCHIVE_DIR:=$(readlink -m "${DIR}/../../archive/${STATE}/")}" \
)"

DOWNLOADED_ZIP_PATH="$(\
  readlink -m "${DOWNLOADED_ZIP_PATH:="${ETL_WORK_DIR}/${STATE}.${ETL_UUID}.inrix-download.zip"}" \
)"


INRIX_SCHEMA_CSV_EXTENSION="${INRIX_SCHEMA_CSV_EXTENSION:=.inrix-schema.csv}"
PARTITIONED_INRIX_CSV_PATH_TEMPLATE="${PARTITIONED_INRIX_CSV_PATH_TEMPLATE:="${ETL_WORK_DIR}/${STATE}.__MONTH__${INRIX_SCHEMA_CSV_EXTENSION}"}"
INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION="${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION:="${INRIX_SCHEMA_CSV_EXTENSION/csv/sorted.csv.gz}"}"
HERE_SCHEMA_CSV_GZ_EXTENSION="${HERE_SCHEMA_CSV_GZ_EXTENSION:="${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION/inrix/here}"}"

export GZIP

export STATE
export ETL_UUID

export STATE_DIR

export ETL_WORK_DIR
export ARCHIVE_DIR

export DOWNLOADED_ZIP_PATH
export PARTITIONED_INRIX_CSV_PATH_TEMPLATE

export INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION
export HERE_SCHEMA_CSV_GZ_EXTENSION
