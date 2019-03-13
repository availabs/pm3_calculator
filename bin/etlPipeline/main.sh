#!/bin/bash

set -e

DOWNLOAD_LINKS="${1:-$DOWNLOAD_LINKS}"

# We need to do this here to preserve relative paths.
source "$( dirname "${BASH_SOURCE[0]}" )/setDefaultVariables.sh" ''

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

if [ "$ETL_DOWNLOAD_ZIP_ARCHIVES" == true ]
then
  echo 'downloadZipArchive'
  source ./downloadZipArchive.sh ''
else
  echo 'Skipping downloadZipArchive.'
fi

if [ "$ETL_RENAME_DOWNLOADS_USING_CONTENTS_FILE" == true ]
then
  echo 'renameDownloadsUsingContentsFile'
  source ./renameDownloadsUsingContentsFile.sh ''
else
  echo 'Skipping renameDownloadsUsingContentsFile.'
fi

if [ "$ETL_VERIFY_ALL_DOWNLOADS_FOR_SAME_STATE" == true ]
then
  echo 'verifyAllDownloadFilesForSameState'
  source ./verifyAllDownloadFilesForSameState.sh ''
else
  if [[ -z "$STATE" ]]
  then
    echo "If the ETL_VERIFY_ALL_DOWNLOADS_FOR_SAME_STATE flag is set to false,"
    echo "  the STATE flag must be set."
    exit 1
  fi
  echo 'Skipping verifyAllDownloadFilesForSameState.'
fi

export STATE
# Now that we have STATE, get more default variables
source ./setDefaultVariables.sh ''

echo 'partitionDownloadedCSVsByMonth'
./inrixSchemaDataStreamFromArchives.sh \
  "$(find "$ETL_WORK_DIR" -name "*${INRIX_DOWNLOAD_ZIP_EXTENSION}" -printf "%p ")" |\
./partitionDownloadedCSVsByMonth.sh

echo 'sortInrixSchemaCSVs'
source ./sortInrixSchemaCSVs.sh ''

if [ "$ETL_CHECK_DOWNLOAD_COMPLETENESS" == true ]
then
  echo 'checkDownloadCompleteness'
  source ./checkDownloadCompleteness.sh ''
else
  echo 'Skipping checkDownloadCompleteness.'
fi

if [ "${ETL_TRANSFORM_TO_CANONICAL_SCHEMA}" == true ]
then
  echo 'transformToCanonicalSchema'
  source ./transformToCanonicalSchema.sh ''
fi

if [ "${ETL_ARCHIVE}" == true ]
then
  echo 'rmINRIXSchemaCSVs' 
  source ./rmINRIXSchemaCSVs.sh ''

  echo 'copyCanonicalSchemaFilesToArchive'
  source ./copyCanonicalSchemaFilesToArchive.sh ''

  echo 'archiveETLWorkDirForColdStorage'
  source ./archiveETLWorkDirForColdStorage.sh ''
fi

popd > /dev/null
