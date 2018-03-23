#!/bin/bash

set -e

if [ -z "${STATE}" ]
then
  echo "USAGE: Specify STATE as a env variable."
  exit 1
fi

ETL_UUID="${ETL_UUID:=$(uuidgen)}"
# To lowercase
STATE=${STATE,,}

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

STATE_DIR=$(readlink -f "${DIR}/../../etl/${STATE}/")

DOWNLOAD_DIR="${STATE_DIR}/${STATE}.${ETL_UUID}.inrix-download"
ETL_WORK_DIR="${STATE_DIR}/${STATE}.${ETL_UUID}.etl-work-dir"

DOWNLOAD_LINK_PATH="${DOWNLOAD_DIR}/link"
DOWNLOADED_ZIP_PATH="${DOWNLOAD_DIR}/data.zip"

DOWNLOADED_CSV_PATH="${ETL_WORK_DIR}/${STATE}.${ETL_UUID}.inrix-schema.csv"

INRIX_SCHEMA_CSV_EXTENSION='.inrix-schema.csv'
INRIX_SCHEMA_SORTED_CSV_EXTENSION="${INRIX_SCHEMA_CSV_EXTENSION/csv/sorted.csv}"
HERE_SCHEMA_CSV_EXTENSION="${INRIX_SCHEMA_SORTED_CSV_EXTENSION/inrix/here}"

export STATE
export ETL_UUID

export STATE_DIR

export DOWNLOAD_DIR
export ETL_WORK_DIR

export DOWNLOAD_LINK_PATH
export DOWNLOADED_ZIP_PATH
export DOWNLOADED_CSV_PATH

export INRIX_SCHEMA_CSV_EXTENSION
export INRIX_SCHEMA_SORTED_CSV_EXTENSION
export HERE_SCHEMA_CSV_EXTENSION


