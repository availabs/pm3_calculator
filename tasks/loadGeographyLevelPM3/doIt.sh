#!/bin/bash

set -e

export TABLE_NAME=geolevel_pm3
export INDEX_COLS=geo
export YEAR=2017 

pushd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null

CSV_DIR="$(readlink -e ../../data/states)"
UPLOADER="$(readlink -e ../../bin/databaseUpload.2.sh)"
META_FILE="meta.geolevel-pm3.json"

find "$CSV_DIR" -type f |
sort |
while read f
do
  STATE="$(basename "$f" | cut -c1-2)"
  export STATE
  $UPLOADER "$f" "$META_FILE"
done

popd >/dev/null
