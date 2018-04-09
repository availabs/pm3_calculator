#!/bin/bash

set -e
set -a

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "${DIR}/../../config/postgres.env"

UUID="$(uuidgen)"

UPLOADER="${DIR}/../../bin/databaseUpload.sh"
META_FILE="${DIR}/../../bin/meta.json"

TMP_DIR="${DIR}/${UUID}"

mkdir -p "$TMP_DIR"

pushd "$TMP_DIR" > /dev/null


STORAGE_HOST=dionysus
STORAGE_DIR='/home/avail/code/pm3_calculator/archive'

ssh "$STORAGE_HOST" find "$STORAGE_DIR" -type f -name '*pm3-calculations*' |\
sort |\
while read f;
do
 
  # If the file is held open by a process, we assume processing is not complete.
  if ssh -n "$STORAGE_HOST" lsof < /dev/null | grep -q "$f"
  then
    continue
  fi

  b="$(basename "$f")"
  b="${b/\.pm3-calculations/}"
  b="${b/\.csv\.gz/}"
  b="${b//\./_}"
  b="${b}.csv"

  state="$(echo "$b" | cut -c1-2)"

	if psql -c "\d \"${state}\".pm3" > /dev/null 2>&1; 
  then
		echo "Table already exists for $state"
    continue
	fi

  # Write the contents of the gzip file on STORAGE_HOST to a local file
  ssh -n "$STORAGE_HOST" "gunzip -c '$f'" < /dev/null > "$b"

  "$UPLOADER" "${TMP_DIR}/$b" "$META_FILE"

  rm -f "$b"
done

rmdir "$TMP_DIR"

popd > /dev/null
