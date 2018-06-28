#!/bin/bash

set -e

STATE_DIR="${STATE_DIR:=$1}"

if [ -z "$STATE_DIR" ]
then
  echo "USAGE: Specify STATE_DIR as a env variable."
  exit 1
fi

SORTER_PATH="$( dirname "${BASH_SOURCE[0]}" )/../sortINRIXDataCSV.sh"
SORTER_PATH=$(readlink -f "$SORTER_PATH")

STATE_DIR=$(readlink -f "${STATE_DIR}")

pushd "$STATE_DIR" > /dev/null

ARR=(`find . -regex ".*\.[1-2][0-9][0-1][0-9][0-9][0-9].inrix-schema.csv" | sort`)

for f in "${ARR[@]}"
do
  # "$SORTER_PATH" "$f" &
  "$SORTER_PATH" "$f"
done

wait

popd > /dev/null
