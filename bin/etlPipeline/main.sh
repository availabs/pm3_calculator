#!/bin/bash

# Usage:
#   Specify STATE, MONTH_RANGE, and DOWNLOAD_LINK as env variables

set -e

source "$( dirname "${BASH_SOURCE[0]}")/setDefaultVariables.sh"

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

if [ ! -f "$DOWNLOADED_ZIP_PATH" ]
then
  echo 'downloadFromRITIS'
  source ./downloadFromRITIS.sh
else
  echo 'Skipping downloadFromRITIS.'
  echo "  Using existing zip archive at ${DOWNLOADED_ZIP_PATH}"
fi

echo 'partitionDownloadedCSVByMonth'
source ./partitionDownloadedCSVByMonth.sh

echo 'sortInrixSchemaCSVs'
source ./sortInrixSchemaCSVs.sh

echo 'transformToHERESchema'
source ./transformToHERESchema.sh

echo 'replaceUUIDWithMonthRange'
source ./replaceUUIDWithMonthRange.sh

popd > /dev/null
