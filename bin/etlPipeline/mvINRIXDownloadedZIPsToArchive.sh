#!/bin/bash

set -e

ETL_WORK_DIR="${1:-"$ETL_WORK_DIR"}"
if [ -z "$ETL_WORK_DIR" ]
then
  echo "USAGE: Specify ETL_WORK_DIR as a env variable or as the 1st cli argument."
  exit 1
fi

STATE_INRIX_DOWNLOAD_ARCHIVE_DIR="${2:-"$STATE_INRIX_DOWNLOAD_ARCHIVE_DIR"}"
if [ -z "$STATE_INRIX_DOWNLOAD_ARCHIVE_DIR" ]
then
  echo "USAGE: Specify STATE_INRIX_DOWNLOAD_ARCHIVE_DIR as a env variable or as the 2nd cli argument."
  exit 1
fi

mkdir -p "$STATE_INRIX_DOWNLOAD_ARCHIVE_DIR"

# Overwrite existing files in the archive? Defaults to false.
ETL_OVERWRITE="${4:-"$ETL_OVERWRITE"}"
ETL_OVERWRITE="${ETL_OVERWRITE:-false}"

INRIX_DOWNLOAD_ZIP_EXTENSION="${INRIX_DOWNLOAD_ZIP_EXTENSION:=.inrix-download.zip}"


find "$ETL_WORK_DIR" -type f -name "*${INRIX_DOWNLOAD_ZIP_EXTENSION}" |\
while read inf 
do

  bname="$(basename "$inf")"
  outf="${STATE_INRIX_DOWNLOAD_ARCHIVE_DIR}/${bname}"

  # FIXME: Use find
  if [[ -f "$outf" && "${ETL_OVERWRITE}" != true ]]
  then
    echo "Skipping mv of $bname to ${STATE_INRIX_DOWNLOAD_ARCHIVE_DIR}"
  else
    mv "$inf" "$outf"
  fi

done
