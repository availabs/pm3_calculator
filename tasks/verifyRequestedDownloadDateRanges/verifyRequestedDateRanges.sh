#!/bin/bash

DATA_DIR="${1:-"$( dirname "${BASH_SOURCE[0]}" )/../../etl"}"
DATA_DIR="$(readlink -e "$DATA_DIR")"

echo '"archive","start_date","end_date"'

find "$DATA_DIR" -type f -name '*inrix-download.zip' |\
sort |\
while read f 
do
  date_range="$(unzip -p "$f" Contents.txt |& sed 's/^caution.*//g; s/.*from //; s/ through /","/')"
  if [[ "${date_range}" ]]
  then
    fname=$(basename "$f")
    echo "\"${fname}\",\"${date_range}\""
  fi
done
