#!/bin/bash

set -e

STORAGE_HOST=lor
STORAGE_DIR='/mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/canonical-archive'

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

LOCAL_ARCHIVE_DIR="$(readlink -m '../../archive/')"

TMP_DIR=$(readlink -m './tmp')

export GZIP=-9

ssh "$STORAGE_HOST" find "$STORAGE_DIR" -regextype posix-extended -regex '.*[a-z]{2}\.2017\.here-schema.sorted.csv.gz' |\
sort |\
while read f;
do
  export STATE="$(basename "$f" | cut -c1-2)"
  
  pm3_dir="${STORAGE_DIR}/${STATE}/pm3-calculations"

  # TEST: Try to mkdir the pm3-calculations dir on the STORAGE_HOST
  #   Without the -p, this command fail if the dir exists.
  #   It it fails, then continue to the next state.
  #   NOTE: This is our lock for concurrent computations
  if ! ssh "$STORAGE_HOST" mkdir "$pm3_dir"
  then
    continue
  fi

  echo "$STATE"

  outf="${LOCAL_ARCHIVE_DIR}/${STATE}/pm3-calculations/${STATE}.2017.pm3-calculations.mean_3.csv.gz"
  outd="$(dirname "$outf")"
  
  mkdir -p "$outd"
  
  (ssh -n lor gunzip -c "$f") | ./index.streaming.js | gzip > "$outf"
done

popd > /dev/null
