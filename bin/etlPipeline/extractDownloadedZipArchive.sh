#!/bin/bash

set -e

source ./setDefaultVariables.sh

if [ -z "$STATE" ]
then
  echo "USAGE: Specify STATE as a env variable."
  exit 1
fi

if [ -z "$MONTH_RANGE" ]
then
  echo "USAGE: Specify MONTH_RANGE as a env variable."
  echo "  E.G.: MONTH_RANGE='201702-201802'"
  exit 1
fi

if [ -z "$STATE_DIR" ]
then
  echo "USAGE: Specify STATE_DIR as a env variable."
  exit 1
fi

if [ -z "$DOWNLOADED_ZIP_PATH" ]
then
  echo "USAGE: Specify DOWNLOADED_ZIP_PATH as a env variable."
  exit 1
fi

# The data.zip included multiple files. We need the name of the datafile.
# This file name varies.
# The following line gets the filename of the largest file in the archive.
DATA_FILE_NAME=$(unzip -Zs "$DOWNLOADED_ZIP_PATH" | tail -n+3 | sed \$d | sort -rn -k4,4 | head -1 | awk '{ print $NF }')

unzip -p "$DOWNLOADED_ZIP_PATH" "$DATA_FILE_NAME" > "$DOWNLOADED_CSV_PATH"
