#!/bin/bash

set -e

STATE_DIR="${STATE_DIR:=$1}"

if [ -z "$STATE_DIR" ]
then
  echo "USAGE: Specify STATE_DIR as a env variable."
  exit 1
fi

TRANSFORMER_PATH="$( dirname "${BASH_SOURCE[0]}" )/../transformINRIXToHERESchema.js"
TRANSFORMER_PATH=$(readlink -f "$TRANSFORMER_PATH")

STATE_DIR=$(readlink -f "${STATE_DIR}")

pushd "$STATE_DIR" > /dev/null

ARR=(`find . -regex ".*\.[1-2][0-9][0-1][0-9][0-9][0-9].inrix-schema.sorted.csv" | sort`)

for f in "${ARR[@]}"
do
  outf="${f/inrix/here}"
  if [ -f "$outf" ]
  then
    echo "File already exists: ${outf}. Skipping..."
    continue
  fi
  echo $f
   "$TRANSFORMER_PATH" < "$f" > "$outf"
done

popd > /dev/null
