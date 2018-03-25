#!/bin/bash

set -e

if [ -z "${STATE}" ]
then
  echo "USAGE: Specify STATE as a env variable."
  exit 1
fi

# Use highest compression level when creating archives
GZIP=-9

ETL_UUID="${ETL_UUID:=$(uuidgen)}"
# To lowercase
STATE=${STATE,,}

# Overwrite existing files (NOT YET IMLEMENTED)
ETL_OVERWRITE="${ETL_OVERWRITE:=true}"
# Move output files to archive directory (NOT YET IMLEMENTED)
ETL_ARCHIVE="${ETL_ARCHIVE:=true}"
# Delete intermediate files
ETL_CLEANUP="${ETL_CLEANUP:=true}"

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

STATE_DIR=$(readlink -f "${DIR}/../../etl/${STATE}/")

DOWNLOAD_DIR="${STATE_DIR}/${STATE}.${ETL_UUID}.inrix-download"
ETL_WORK_DIR="${STATE_DIR}/${STATE}.${ETL_UUID}.etl-work-dir"
ARCHIVE_DIR="${ARCHIVE_DIR:=$(readlink -m "${DIR}/../../archive/${STATE}/")}"

DOWNLOAD_LINK_PATH="${DOWNLOAD_DIR}/link"
DOWNLOADED_ZIP_PATH="${DOWNLOAD_DIR}/data.zip"

INRIX_SCHEMA_CSV_EXTENSION='.inrix-schema.csv'
PARTITIONED_INRIX_CSV_PATH_TEMPLATE="${ETL_WORK_DIR}/${STATE}.__MONTH__${INRIX_SCHEMA_CSV_EXTENSION}"
INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION="${INRIX_SCHEMA_CSV_EXTENSION/csv/sorted.csv.gz}"
HERE_SCHEMA_CSV_GZ_EXTENSION="${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION/inrix/here}"

export GZIP

export STATE
export ETL_UUID

export STATE_DIR

export DOWNLOAD_DIR
export ETL_WORK_DIR
export ARCHIVE_DIR

export DOWNLOAD_LINK_PATH
export DOWNLOADED_ZIP_PATH
export PARTITIONED_INRIX_CSV_PATH_TEMPLATE

export INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION
export HERE_SCHEMA_CSV_GZ_EXTENSION

