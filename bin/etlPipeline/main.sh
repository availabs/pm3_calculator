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

# The following updates the ETL_WORK_DIR and DOWNLOADED_ZIP_PATH env variables
echo 'replaceUUIDWithMonthRange'
source ./replaceUUIDWithMonthRange.sh

if [ "${ETL_ARCHIVE}" == true ]
then
  echo 'mvINRIXDownloadZIPToArchive'
  source ./mvINRIXDownloadZIPToArchive.sh

  echo 'mvINRIXSchemaCSVsToArchive'
  source ./mvINRIXSchemaCSVsToArchive.sh

  echo 'mvHERESchemaFilesToArchive'
  source ./mvHERESchemaFilesToArchive.sh
fi

if [ "${ETL_CLEANUP}" == true ]
then
  echo 'removeETLWorkDir'
  source ./removeETLWorkDir.sh
fi

popd > /dev/null
