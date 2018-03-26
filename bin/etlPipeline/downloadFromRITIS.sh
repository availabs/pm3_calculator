#!/bin/bash

set -e

DOWNLOAD_LINK="${1:-$DOWNLOAD_LINK}"

DOWNLOADED_ZIP_PATH="$(readlink -m "${2:-$DOWNLOADED_ZIP_PATH}")"

if [ -z "${DOWNLOAD_LINK}" ]
then
  echo "USAGE: Specify DOWNLOAD_LINK as an env variable or the 1st cli arg."
  exit 1
fi

if [ -z "${DOWNLOADED_ZIP_PATH}" ]
then
  echo "USAGE: Specify DOWNLOADED_ZIP_PATH as a env variable or the 2nd cli arg."
  exit 1
fi

# Create the directory for the download zip, if dne
mkdir -p "$(dirname "$DOWNLOADED_ZIP_PATH")"

# Download the zip
curl "${DOWNLOAD_LINK}" > "$DOWNLOADED_ZIP_PATH"
