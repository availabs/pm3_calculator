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

unzip -p "$DOWNLOADED_ZIP_PATH" > "$DOWNLOADED_CSV_PATH"
