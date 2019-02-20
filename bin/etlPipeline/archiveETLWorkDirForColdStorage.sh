#!/bin/bash

set -e

ETL_WORK_DIR="${1:-"$ETL_WORK_DIR"}"
if [ -z "$ETL_WORK_DIR" ]
then
  (>&2 echo "USAGE: Specify ETL_WORK_DIR as a env variable or as the 1st cli argument.")
  exit 1
fi

mkdir -p "$STATE_COLD_STORAGE_ARCHIVE_DIR"

ETL_WORK_DIR="$( realpath "$ETL_WORK_DIR" )"


STATE_COLD_STORAGE_ARCHIVE_DIR="${2:-"$STATE_COLD_STORAGE_ARCHIVE_DIR"}"
if [ -z "$STATE_COLD_STORAGE_ARCHIVE_DIR" ]
then
  (>&2 echo "USAGE: Specify STATE_COLD_STORAGE_ARCHIVE_DIR as a env variable or as the 2nd cli argument.")
  exit 1
fi

# Get the absolute path to the STATE_COLD_STORAGE_ARCHIVE_DIR
STATE_COLD_STORAGE_ARCHIVE_DIR="$( realpath "$STATE_COLD_STORAGE_ARCHIVE_DIR" )"

# Overwrite existing files in the archive? Defaults to true.
ETL_OVERWRITE="${ETL_OVERWRITE:-true}"
CANONICAL_SCHEMA_CSV_GZ_EXTENSION="${CANONICAL_SCHEMA_CSV_GZ_EXTENSION:-npmrds.csv.gz}"

TIMESTAMP="$( date +%Y%m%d%H%M%S )"

# Get the date range of the data.
CANONICAL_SCHEMA_FILES="$(
  find "$ETL_WORK_DIR" -type f -name "*${CANONICAL_SCHEMA_CSV_GZ_EXTENSION}" -printf '%f\n' |
    sort -u
)"

# Get the STATE from the file names.
STATE="$(
  head -n1 <<< "$CANONICAL_SCHEMA_FILES" | grep -oe '^.\{2\}'
)"

# Get the MIN_MONTH from the file names.
MIN_MONTH="$(
  head -n1 <<< "$CANONICAL_SCHEMA_FILES" | grep -oe '[0-9]\{6\}'
)"

# Get the MAX_MONTH from the file names.
MAX_MONTH="$(
  tail -n1 <<< "$CANONICAL_SCHEMA_FILES" | grep -oe '[0-9]\{6\}'
)"

# Set the DATE_RANGE string
if [[ "$MIN_MONTH" = "$MAX_MONTH" ]]; then
  # If only one month
  DATE_RANGE="$MIN_MONTH"
else 
  # If multiple months
  DATE_RANGE="${MIN_MONTH}-${MAX_MONTH}"
fi

ETL_WORK_DIR_BASENAME="$( dirname "$ETL_WORK_DIR" )"

mkdir -p "$STATE_COLD_STORAGE_ARCHIVE_DIR"

ARCHIVE_DIR_NAME="${STATE}.${DATE_RANGE}.npmrds.${TIMESTAMP}"
ARCHIVE_DIR_PATH="${ETL_WORK_DIR_BASENAME}/${ARCHIVE_DIR_NAME}/"

if [[ -d "$ARCHIVE_DIR_PATH" ]]; then
  (>&2 echo "ERROR: ${ARCHIVE_DIR_PATH} already exists. Skipping archive step.")
  exit 1
fi

ARCHIVE_TAR_NAME="${ARCHIVE_DIR_NAME}.tar"
ARCHIVE_TAR_PATH="${STATE_COLD_STORAGE_ARCHIVE_DIR}/${ARCHIVE_TAR_NAME}"

## Create the tar archive.
##   Renaming the ETL_WORK_DIR in the archive to the ARCHIVE_DIR_NAME
##   and write the tar archive to the cold_storage directory.
pushd "${ETL_WORK_DIR}/.." >/dev/null

mv "$ETL_WORK_DIR" "$ARCHIVE_DIR_NAME"

tar -cf "$ARCHIVE_TAR_PATH" "$ARCHIVE_DIR_NAME"

if tar -df "$ARCHIVE_TAR_PATH" "$ARCHIVE_DIR_NAME"; then
  rm -rf "$ARCHIVE_DIR_NAME"
else
  (>&2 echo "ERROR: Creating tar archive $ETL_WORK_DIR_BASENAME/$ARCHIVE_TAR_PATH failed")
  exit 1
fi

popd >/dev/null
