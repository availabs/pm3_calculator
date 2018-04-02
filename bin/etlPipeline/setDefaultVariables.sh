#!/bin/bash

set -e

# To lowercase.
STATE=${STATE,,}

# Use highest compression level when creating archives
GZIP=-9

# If env var ETL_UUID not set, create uuid
ETL_UUID="${ETL_UUID:="$(uuidgen)"}"

# Flag whether to download data from RITIS
#   Defaults to whether DOWNLOAD_LINKS were provided
[[ -z "$ETL_DOWNLOAD_ZIP_ARCHIVES" ]] && ETL_DOWNLOAD_ZIP_ARCHIVES="$DOWNLOAD_LINKS"
if [[ -z "$ETL_DOWNLOAD_ZIP_ARCHIVES" ]]
then
  ETL_DOWNLOAD_ZIP_ARCHIVES=false
else
  # Convert the value to a boolean flag
  [[ "$ETL_DOWNLOAD_ZIP_ARCHIVES" != false ]] && ETL_DOWNLOAD_ZIP_ARCHIVES=true
fi

ETL_RENAME_DOWNLOADS_USING_CONTENTS_FILE="${ETL_RENAME_DOWNLOADS_USING_CONTENTS_FILE:=true}"

ETL_VERIFY_ALL_DOWNLOADS_FOR_SAME_STATE="${ETL_VERIFY_ALL_DOWNLOADS_FOR_SAME_STATE:=true}"

# Overwrite existing files (NOT YET IMLEMENTED)
ETL_OVERWRITE="${ETL_OVERWRITE:=true}"

# Overwrite existing files (NOT YET IMLEMENTED)
ETL_TRANSFORM_TO_HERE_SCHEMA="${ETL_TRANSFORM_TO_HERE_SCHEMA:=true}"

# Move output files to archive directory. Defaults to true
ETL_ARCHIVE="${ETL_ARCHIVE:=true}"

# Delete intermediate files and directories
#  Default value is the value of ETL_ARCHIVE
ETL_CLEANUP="${ETL_CLEANUP:="$ETL_ARCHIVE"}"

# Dir of this script so we can use relative paths
this_dir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

ETL_WORK_DIR="$(\
  readlink -m "${ETL_WORK_DIR:="${this_dir}/../../etl/${ETL_UUID}.etl-work-dir"}" \
)"

INRIX_DOWNLOAD_ZIP_EXTENSION="${INRIX_DOWNLOAD_ZIP_EXTENSION:=.inrix-download.zip}"

# Defined these env variables iff STATE is defined
if [ ! -z "$STATE" ]
then
  STATE_DIR="$(\
    readlink -m "${STATE_DIR:="$(readlink -f "${this_dir}/../../etl/${STATE}/")"}" \
  )"

  STATE_ARCHIVE_DIR="$(\
    readlink -m "${STATE_ARCHIVE_DIR:=$(readlink -m "${this_dir}/../../archive/${STATE}/")}" \
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

  PARTITIONED_INRIX_CSV_PATH_TEMPLATE="${PARTITIONED_INRIX_CSV_PATH_TEMPLATE:="${ETL_WORK_DIR}/${STATE}.__MONTH__${INRIX_SCHEMA_CSV_EXTENSION}"}"
fi

INRIX_SCHEMA_CSV_EXTENSION="${INRIX_SCHEMA_CSV_EXTENSION:=.inrix-schema.csv}"
INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION="${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION:="${INRIX_SCHEMA_CSV_EXTENSION/csv/sorted.csv.gz}"}"
HERE_SCHEMA_SORTED_CSV_GZ_EXTENSION="${HERE_SCHEMA_SORTED_CSV_GZ_EXTENSION:="${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION/inrix/here}"}"

export GZIP

export STATE
export ETL_DOWNLOAD_ZIP_ARCHIVES
export ETL_RENAME_DOWNLOADS_USING_CONTENTS_FILE
export ETL_VERIFY_ALL_DOWNLOADS_FOR_SAME_STATE
export ETL_UUID
export ETL_OVERWRITE
export ETL_ARCHIVE
export ETL_CLEANUP

export STATE_DIR

export ETL_WORK_DIR
export STATE_ARCHIVE_DIR
export STATE_INRIX_DOWNLOAD_ARCHIVE_DIR
export STATE_INRIX_SCHEMA_ARCHIVE_DIR
export STATE_HERE_SCHEMA_ARCHIVE_DIR

export INRIX_DOWNLOAD_ZIP_EXTENSION
export PARTITIONED_INRIX_CSV_PATH_TEMPLATE

export INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION
export HERE_SCHEMA_SORTED_CSV_GZ_EXTENSION
