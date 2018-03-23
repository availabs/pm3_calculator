#!/bin/bash

# Usage:
#   Specify STATE, MONTH_RANGE, and DOWNLOAD_LINK as env variables

set -e

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

source ./setDefaultVariables.sh

echo 'downloadFromRITIS'
source ./downloadFromRITIS.sh

echo 'extractDownloadedZipArchive'
source ./extractDownloadedZipArchive.sh

echo 'partitionDownloadedCSVByMonth'
source ./partitionDownloadedCSVByMonth.sh

echo 'sortInrixSchemaCSVs'
source ./sortInrixSchemaCSVs.sh

echo 'transformToHERESchema'
source ./transformToHERESchema.sh

echo 'replaceUUIDWithMonthRange'
source ./replaceUUIDWithMonthRange.sh

popd > /dev/null
