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


# Delete intermediate files and directories
#  Default value is the value of ETL_ARCHIVE
ETL_CHECK_DOWNLOAD_COMPLETENESS="${ETL_CHECK_DOWNLOAD_COMPLETENESS:=true}"

ETL_RENAME_DOWNLOADS_USING_CONTENTS_FILE="${ETL_RENAME_DOWNLOADS_USING_CONTENTS_FILE:=true}"

ETL_VERIFY_ALL_DOWNLOADS_FOR_SAME_STATE="${ETL_VERIFY_ALL_DOWNLOADS_FOR_SAME_STATE:=true}"

# Overwrite existing files (NOT YET IMLEMENTED)
ETL_OVERWRITE="${ETL_OVERWRITE:=true}"

# Overwrite existing files (NOT YET IMLEMENTED)
ETL_TRANSFORM_TO_CANONICAL_SCHEMA="${ETL_TRANSFORM_TO_CANONICAL_SCHEMA:=true}"

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

CANONICAL_ARCHIVE_DIR="$(\
  readlink -m "${CANONICAL_ARCHIVE_DIR:=$(readlink -m "${this_dir}/../../archive/canonical-archive/")}" \
)"

COLD_STORAGE_ARCHIVE_DIR="$(\
  readlink -m "${COLD_STORAGE_ARCHIVE_DIR:=$(readlink -m "${this_dir}/../../archive/cold-storage/")}" \
)"

# Defined these env variables iff STATE is defined
if [ ! -z "$STATE" ]
then
  STATE_CANONICAL_SCHEMA_ARCHIVE_DIR="$(\
    readlink -m "${STATE_CANONICAL_SCHEMA_ARCHIVE_DIR:=$(readlink -m "${CANONICAL_ARCHIVE_DIR}/${STATE}/")}" \
  )"

  STATE_COLD_STORAGE_ARCHIVE_DIR="$(\
    readlink -m "${STATE_COLD_STORAGE_ARCHIVE_DIR:=$(readlink -m "${COLD_STORAGE_ARCHIVE_DIR}/${STATE}/")}" \
  )"

  ## The __MONTH__ placeholder is replaced with the respective month in the code using this template.
  PARTITIONED_INRIX_CSV_PATH_TEMPLATE="${PARTITIONED_INRIX_CSV_PATH_TEMPLATE:="${ETL_WORK_DIR}/${STATE}.__MONTH__${INRIX_SCHEMA_CSV_EXTENSION}"}"
fi

INRIX_SCHEMA_CSV_EXTENSION="${INRIX_SCHEMA_CSV_EXTENSION:=.inrix-schema.csv}"
INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION="${INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION:="${INRIX_SCHEMA_CSV_EXTENSION/csv/sorted.csv.gz}"}"

CANONICAL_SCHEMA_CSV_GZ_EXTENSION="${CANONICAL_SCHEMA_CSV_GZ_EXTENSION:=.npmrds.csv.gz}"

export GZIP

export STATE

export ETL_DOWNLOAD_ZIP_ARCHIVES
export ETL_CHECK_DOWNLOAD_COMPLETENESS

export ETL_RENAME_DOWNLOADS_USING_CONTENTS_FILE
export ETL_VERIFY_ALL_DOWNLOADS_FOR_SAME_STATE

export ETL_UUID
export ETL_TRANSFORM_TO_CANONICAL_SCHEMA
export ETL_OVERWRITE
export ETL_ARCHIVE
export ETL_CLEANUP

export ETL_WORK_DIR
export CANONICAL_ARCHIVE_DIR
export COLD_STORAGE_ARCHIVE_DIR

export INRIX_DOWNLOAD_ZIP_EXTENSION

export STATE_CANONICAL_SCHEMA_ARCHIVE_DIR
export STATE_COLD_STORAGE_ARCHIVE_DIR

export PARTITIONED_INRIX_CSV_PATH_TEMPLATE

export INRIX_SCHEMA_SORTED_CSV_GZ_EXTENSION
export CANONICAL_SCHEMA_CSV_GZ_EXTENSION
