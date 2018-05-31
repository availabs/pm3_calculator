#!/bin/bash

set -e

STORAGE_HOST=lor
STORAGE_DIR='/mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/canonical-archive'

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

LOCAL_ARCHIVE_DIR="$(readlink -m '../../archive/')"
COMPUTER="$(readlink -m '../../index.streaming.js')"

export GZIP=-9

PREV_STATE=''

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
  if ! ssh -n "$STORAGE_HOST" mkdir "$pm3_dir" > /dev/null 2>&1
  then
    # If this process locked the state dir on STORAGE_HOST,
    #   it must process the state for any additional years.
    # Because the input file names are sorted, we are guaranteed
    #   that files for a given state occur consecutively.
    if [ "$STATE" != "$PREV_STATE" ]; then
      continue
    fi
  fi

  >&2 echo "$STATE: $YEAR"

  outf="${LOCAL_ARCHIVE_DIR}/${STATE}/pm3-calculations/${STATE}.${YEAR}.pm3-calculations.mean_12.csv.gz"
  outd="$(dirname "$outf")"
  
  mkdir -p "$outd"
  
  # (ssh -n "$STORAGE_HOST" gunzip -c "$f") | "$COMPUTER" | gzip > "$outf"
  ssh -n "$STORAGE_HOST" "cat $f" | gunzip -c | "$COMPUTER" | gzip > "$outf"

  PREV_STATE="$STATE"
done

popd > /dev/null
