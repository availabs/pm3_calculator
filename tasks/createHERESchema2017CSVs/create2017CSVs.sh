#!/bin/bash

DATA_DIR="${1:-"$( dirname "${BASH_SOURCE[0]}" )/../../archive"}"
DATA_DIR="$(readlink -e "$DATA_DIR")"

CSV_CREATOR="$( dirname "${BASH_SOURCE[0]}" )/../../utils/hereSchemaDataStream.bash.gzip.sh"

export GZIP=-9
export YEAR=2017

find "$DATA_DIR" -maxdepth 1 -type d -printf '%P\n' |\
  sed '/^$/d' |\
  sort |\
while read state
do
  indir="${DATA_DIR}/${state}/here-schema"
  outf="${indir}/${state}.${YEAR}.here-schema.csv.gz"
  "$CSV_CREATOR" "$indir" | gzip > "$outf"
done
