#!/bin/bash

# Usage:
#   Specify STATE, MONTH_RANGE, and DOWNLOAD_LINK as env variables

set -e

source ./setDefaultVariables.sh

source ./downloadFromRITIS.sh

source ./extractDownloadedZipArchive.sh

source ./partitionDownloadedCSVByMonth.sh

source ./sortInrixSchemaCSVs.sh

sources ./transformToHERESchema.sh
