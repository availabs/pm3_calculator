#!/bin/bash

set -e


DOWNLOADED_ZIP_PATH="${1:-"$DOWNLOADED_ZIP_PATH"}"

if [ -z "$DOWNLOADED_ZIP_PATH" ]
then
  echo "USAGE: Specify DOWNLOADED_ZIP_PATH as a env variable or as the 1st cli argument."
  exit 1
fi

DOWNLOADED_ZIP_PATH=$(readlink -f "${DOWNLOADED_ZIP_PATH}")

STATE_INRIX_DOWNLOAD_ARCHIVE_DIR="${2:-"$STATE_INRIX_DOWNLOAD_ARCHIVE_DIR"}"

if [ -z "$STATE_INRIX_DOWNLOAD_ARCHIVE_DIR" ]
then
  echo "USAGE: Specify STATE_INRIX_DOWNLOAD_ARCHIVE_DIR as a env variable or as the 2nd cli argument."
  exit 1
fi

mkdir -p "$STATE_INRIX_DOWNLOAD_ARCHIVE_DIR"

ETL_OVERWRITE="${4:-"$ETL_OVERWRITE"}"
ETL_OVERWRITE="${ETL_OVERWRITE:-false}"

bname="$(basename "$DOWNLOADED_ZIP_PATH")"
outf="${STATE_INRIX_DOWNLOAD_ARCHIVE_DIR}/${bname}"

if [[ -f "$outf" && "${ETL_OVERWRITE}" != true ]]
then
  echo "Skipping mv of $bname to ${STATE_INRIX_DOWNLOAD_ARCHIVE_DIR}"
else
  mv "$DOWNLOADED_ZIP_PATH" "$outf"
  DOWNLOADED_ZIP_PATH="${outf}"
fi

