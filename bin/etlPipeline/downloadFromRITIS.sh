#!/bin/bash

set -e

source ./setDefaultVariables.sh

if [ -z "${DOWNLOAD_LINK}" ]
then
  echo "USAGE: Specify DOWNLOAD_LINK as a env variable."
  exit 1
fi

if [ -z "${DOWNLOAD_LINK_PATH}" ]
then
  echo "USAGE: Specify DOWNLOAD_LINK_PATH as a env variable."
  exit 1
fi

if [ -z "${DOWNLOADED_ZIP_PATH}" ]
then
  echo "USAGE: Specify DOWNLOADED_ZIP_PATH as a env variable."
  exit 1
fi

DDIR=$(dirname "$DOWNLOADED_ZIP_PATH")

if [ -d "$DOWNLOAD_DIR" ]
then
  echo "Download directory ${DDIR} exists... skipping download"
  exit 0
fi

mkdir -p "$DDIR"

echo "${DOWNLOAD_LINK}" > "${DOWNLOAD_LINK_PATH}"

curl "${DOWNLOAD_LINK}" > "$DOWNLOADED_ZIP_PATH"
