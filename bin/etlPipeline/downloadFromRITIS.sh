#!/bin/bash

set -e

source ./setDefaultVariables.sh

if [ -z "${DOWNLOAD_LINK}" ]
then
  echo "USAGE: Specify DOWNLOAD_LINK as a env variable."
  exit 1
fi

mkdir -p "$STATE_DIR"

if [ -d "$DOWNLOAD_DIR" ]
then
  echo "Download ${DOWNLOAD_DIR} directory exists... skipping download"
  exit 0
fi

mkdir -p "$DOWNLOAD_DIR"

DOWNLOADED_ZIP_PATH="${DOWNLOAD_DIR}/data.zip"

echo "${DOWNLOAD_LINK}" > "${DOWNLOAD_DIR}/link"

curl "${DOWNLOAD_LINK}" > "$DOWNLOADED_ZIP_PATH"
