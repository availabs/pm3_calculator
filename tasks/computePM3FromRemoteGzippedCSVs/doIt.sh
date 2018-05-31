#!/bin/bash

set -e

STORAGE_HOST=lor
STORAGE_DIR='/mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/canonical-archive'

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

LOCAL_ARCHIVE_DIR="$(readlink -m '../../archive/')"
COMPUTER="$(readlink -m '../../index.streaming.js')"

export GZIP=-9

# Example file name: ny.2017.here-schema.sorted.csv.gz
ssh "$STORAGE_HOST" find "$STORAGE_DIR" -regextype posix-extended -regex '.*[[:alpha:]]{2}\.[[:digit:]]{4}\.here-schema.sorted.csv.gz' |\
sort |\
while read f;
do
  fbasename="$(basename "$f")"

  STATE="$( cut -c1-2 <<< "$fbasename" )"
  export STATE

  YEAR="$( cut -c4-7 <<< "$fbasename" )"
  export YEAR
  
  pm3_dir="${STORAGE_DIR}/${STATE}/pm3-calculations"

  # TEST: Try to mkdir the pm3-calculations dir on the STORAGE_HOST
  #   Without the -p, this command fail if the dir exists.
  #   It it fails, then continue to the next state.
  #   NOTE: This is our lock for concurrent computations
  # if ! ssh -n  dionysus mkdir "$(pwd)/${STATE}" > /dev/null 2>&1
  if ! ssh -n "$STORAGE_HOST" mkdir "$pm3_dir" > /dev/null 2>&1
  then
    continue
  fi

  >&2 echo "$STATE"

  outf="${LOCAL_ARCHIVE_DIR}/${STATE}/pm3-calculations/${STATE}.2017.pm3-calculations.mean_12.csv.gz"
  outd="$(dirname "$outf")"
  
  mkdir -p "$outd"
  
  # (ssh -n "$STORAGE_HOST" gunzip -c "$f") | "$COMPUTER" | gzip > "$outf"
  ssh -n "$STORAGE_HOST" "cat $f" | gunzip -c | "$COMPUTER" | gzip > "$outf"
done

popd > /dev/null
