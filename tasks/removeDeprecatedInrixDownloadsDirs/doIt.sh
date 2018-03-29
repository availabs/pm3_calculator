#!/bin/bash

DATA_DIR="${1:-"$( dirname "${BASH_SOURCE[0]}" )/../../etl"}"
DATA_DIR="$(readlink -e "$DATA_DIR")"

find "$DATA_DIR" -type d -name '*inrix-download' |\
while read d 
do
  inf="${d}/data.zip"
  outd="${d/inrix-download/etl-work-dir}"
  outf="${outd}/$(basename "${d}").zip"
  mv "$inf" "$outf"
  rm -rf "$d"
done
