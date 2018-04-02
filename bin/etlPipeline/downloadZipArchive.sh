#!/bin/bash

set -e

DOWNLOAD_LINKS="${1:-$DOWNLOAD_LINKS}"

if [ -z "${DOWNLOAD_LINKS}" ]
then
  echo "USAGE: Specify DOWNLOAD_LINKS as an env variable or the 1st cli arg."
  exit 1
fi

ETL_WORK_DIR="$( readlink -f "${2:-"$ETL_WORK_DIR"}" )"

if [ -z "$ETL_WORK_DIR" ]
then
  echo "USAGE: Specify ETL_WORK_DIR as a env variable or as the 2nd cli arg"
  exit 1
fi

INRIX_DOWNLOAD_ZIP_EXTENSION="${INRIX_DOWNLOAD_ZIP_EXTENSION:=.inrix-download.zip}"

mkdir -p "$ETL_WORK_DIR"

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

# https://nixshell.wordpress.com/2007/09/26/ifs-internal-field-separator/
oIFS=$IFS

IFS=', ' read -r -a links <<< "$DOWNLOAD_LINKS"

IFS=$oIFS

for link in "${links[@]}"
do
  # Remove everything preceeding, and including, the last slash from the url
  #   and remove the query string and the .zip extension
  fname="$(echo "$link" | sed "s/.*\///; s/\?.*//; s/${INRIX_DOWNLOAD_ZIP_EXTENSION}//g; s/\.zip$//g")"

  # If the fname does not have the .zip extension, append it.
  fname="${fname}${INRIX_DOWNLOAD_ZIP_EXTENSION}"

  fname="${ETL_WORK_DIR}/$fname"

  curl "$link" > "$fname"
done

popd > /dev/null
