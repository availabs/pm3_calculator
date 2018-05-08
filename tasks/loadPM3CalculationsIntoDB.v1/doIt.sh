#!/bin/bash

set -e

export TABLE_NAME=pm3_npmrdsv1
export INDEX_COLS=tmc

pushd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null

CSV_DIR="${1:-../../data/pm3_npmrdsv1}"

if ! CSV_DIR="$(readlink -e "$CSV_DIR")"
then
  echo 'The CSV dir does not exist.'
  exit 1
fi

UPLOADER="$(readlink -e ../../bin/databaseUpload.2.sh)"
META_FILE="meta.json"

find "$CSV_DIR" -type f |
sort |
while read f
do
  STATE="$(basename "$f" | cut -c1-2)"
  YEAR="$(basename "$f" | cut -c4-7)"

  export STATE
  export YEAR

  $UPLOADER "$f" "$META_FILE"
done

popd >/dev/null
