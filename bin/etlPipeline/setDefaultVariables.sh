#!/bin/bash

set -e

if [ -z "${STATE}" ]
then
  echo "USAGE: Specify STATE as a env variable."
  exit 1
fi

if [ -z "${MONTH_RANGE}" ]
then
  echo "USAGE: Specify MONTH_RANGE as a env variable."
  echo "  E.G.: MONTH_RANGE='201702-201802'"
  exit 1
fi

# To lowercase
STATE=${STATE,,}

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

STATE_DIR=$(readlink -f "${DIR}/../../etl/${STATE}/")

DOWNLOAD_DIR="${STATE_DIR}/${STATE}.${MONTH_RANGE}.inrix-download"
DOWNLOAD_DIR_TAR_PATH="${DOWNLOAD_DIR}.tar.gz"

DOWNLOADED_ZIP_PATH="${DOWNLOAD_DIR}/data.zip"
DOWNLOADED_CSV_PATH="${STATE_DIR}/${STATE}.${MONTH_RANGE}.inrix-schema.csv"

export STATE

export DOWNLOAD_DIR
export DOWNLOAD_DIR_TAR_PATH

export DOWNLOADED_ZIP_PATH
export DOWNLOADED_CSV_PATH
