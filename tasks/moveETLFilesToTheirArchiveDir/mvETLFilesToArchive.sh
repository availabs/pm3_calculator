#!/bin/bash

ETL_DIR="${1:-"$( dirname "${BASH_SOURCE[0]}" )/../../etl"}"
ETL_DIR="$(readlink -e "$ETL_DIR")"

ARCHIVE_DIR="${1:-"$( dirname "${BASH_SOURCE[0]}" )/../../archive"}"
ARCHIVE_DIR="$(readlink -m "$ARCHIVE_DIR")"

find "$ETL_DIR" -type f -name '*inrix-download.zip' |\
while read f 
do
  bname="$(basename "$f")"
  state="${bname/.*/}"

  outd="$(readlink -m "${ARCHIVE_DIR}/${state}/inrix-download/")"

  mkdir -p "$outd"

  mv "$f" "$outd"
done

find "$ETL_DIR" -type f -name '*inrix-schema.sorted.csv.gz' |\
while read f 
do
  bname="$(basename "$f")"
  state="${bname/.*/}"

  outd="$(readlink -m "${ARCHIVE_DIR}/${state}/inrix-schema/")"

  mkdir -p "$outd"

  mv "$f" "$outd"
done

find "$ETL_DIR" -type f -name '*here-schema.sorted.csv.gz' |\
while read f 
do
  bname="$(basename "$f")"
  state="${bname/.*/}"

  outd="$(readlink -m "${ARCHIVE_DIR}/${state}/here-schema/")"

  mkdir -p "$outd"

  mv "$f" "$outd"
done

find "$ETL_DIR" -type d |\
  awk '{ print length, $0 }' |\
  sort -rn |\
  cut -d' ' -f2- |\
while read d
do
  if [ "$(ls -A "$d")" ]
  then
    echo "$d is not empty... skipping rm -rf"
  else
    echo rm -rf "$d"
  fi

done

