#!/bin/bash

# Usage:
#   Specify STATE, MONTH_RANGE, and DOWNLOAD_LINK as env variables

set -e

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

source ./setDefaultVariables.sh

source ./downloadFromRITIS.sh

source ./extractDownloadedZipArchive.sh

source ./partitionDownloadedCSVByMonth.sh

source ./sortInrixSchemaCSVs.sh

sources ./transformToHERESchema.sh

popd > /dev/null
