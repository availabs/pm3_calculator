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

# Rename files and directories with ETL_UUID in their name,
#   replacing the UUID with the downloaded data's month range
ETL_RENAME_UUID="${ETL_RENAME_UUID:=true}"

# Overwrite existing files (NOT YET IMLEMENTED)
ETL_OVERWRITE="${ETL_OVERWRITE:=true}"

# Overwrite existing files (NOT YET IMLEMENTED)
ETL_TRANSFORM_TO_HERE_SCHEMA="${ETL_TRANSFORM_TO_HERE_SCHEMA:=true}"

# Move output files to archive directory
#  Defaults to the flag set for ETL_RENAME_UUID
ETL_ARCHIVE="${ETL_ARCHIVE:="$ETL_RENAME_UUID"}"

# Delete intermediate files and directories
#  Default value is the value of ETL_ARCHIVE
ETL_CLEANUP="${ETL_CLEANUP:="$ETL_ARCHIVE"}"

# Dir of this script so we can use relative paths
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

STATE_DIR="$(\
  readlink -m "${STATE_DIR:="$(readlink -f "${DIR}/../../etl/${STATE}/")"}" \
)"

ETL_WORK_DIR="$(\
  readlink -m "${ETL_WORK_DIR:="${STATE_DIR}/${STATE}.${ETL_UUID}.etl-work-dir"}" \
)"

STATE_ARCHIVE_DIR="$(\
  readlink -m "${STATE_ARCHIVE_DIR:=$(readlink -m "${DIR}/../../archive/${STATE}/")}" \
)"

STATE_INRIX_DOWNLOAD_ARCHIVE_DIR="$(\
  readlink -m "${STATE_INRIX_DOWNLOAD_ARCHIVE_DIR:=$(readlink -m "${STATE_ARCHIVE_DIR}/inrix-download")}" \
)"

STATE_INRIX_SCHEMA_ARCHIVE_DIR="$(\
  readlink -m "${STATE_INRIX_SCHEMA_ARCHIVE_DIR:=$(readlink -m "${STATE_ARCHIVE_DIR}/inrix-schema")}" \
)"

STATE_HERE_SCHEMA_ARCHIVE_DIR="$(\
  readlink -m "${STATE_HERE_SCHEMA_ARCHIVE_DIR:=$(readlink -m "${STATE_ARCHIVE_DIR}/here-schema")}" \
)"

INRIX_DOWNLOAD_ZIP_EXTENSION="${INRIX_DOWNLOAD_ZIP_EXTENSION:=.inrix-download.zip}"

DOWNLOADED_ZIP_PATH="$(\
  readlink -m "${DOWNLOADED_ZIP_PATH:="${ETL_WORK_DIR}/${STATE}.${ETL_UUID}${INRIX_DOWNLOAD_ZIP_EXTENSION}"}" \
)"

INRIX_SCHEMA_CSV_EXTENSION="${INRIX_SCHEMA_CSV_EXTENSION:=.inrix-schema.csv}"
PARTITIONED_INRIX_CSV_PATH_TEMPLATE="${PARTITIONED_INRIX_CSV_PATH_TEMPLATE:="${ETL_WORK_DIR}/${STATE}.__MONTH__${INRIX_SCHEMA_CSV_EXTENSION}"}"
INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION="${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION:="${INRIX_SCHEMA_CSV_EXTENSION/csv/sorted.csv.gz}"}"
HERE_SCHEMA_SORTED_CSV_GZ_EXTENSION="${HERE_SCHEMA_SORTED_CSV_GZ_EXTENSION:="${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION/inrix/here}"}"

export GZIP

export STATE

export ETL_UUID
export ETL_RENAME_UUID
export ETL_TRANSFORM_TO_HERE_SCHEMA
export ETL_OVERWRITE
export ETL_ARCHIVE
export ETL_CLEANUP

export STATE_DIR

export ETL_WORK_DIR
export STATE_ARCHIVE_DIR
export STATE_INRIX_DOWNLOAD_ARCHIVE_DIR
export STATE_INRIX_SCHEMA_ARCHIVE_DIR
export STATE_HERE_SCHEMA_ARCHIVE_DIR

export DOWNLOADED_ZIP_PATH
export PARTITIONED_INRIX_CSV_PATH_TEMPLATE

export INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION
export HERE_SCHEMA_SORTED_CSV_GZ_EXTENSION
