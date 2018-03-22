#!/bin/bash

set -e

DOWNLOADED_CSV_PATH="${DOWNLOADED_CSV_PATH:=$1}"

if [ -z "$DOWNLOADED_CSV_PATH" ]
then
  echo "USAGE: Specify DOWNLOADED_CSV_PATH as a env variable."
  exit 1
fi

DOWNLOADED_CSV_PATH=$(readlink -f "${DOWNLOADED_CSV_PATH}")

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

../partitionDataByMonth.sh "${DOWNLOADED_CSV_PATH}"

popd > /dev/null
