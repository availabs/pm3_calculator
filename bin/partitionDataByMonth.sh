#!/bin/bash

if [ -z "$1" ]; then
  echo "USAGE: Specify the input csv file path as the first cli argument."
  exit 1
fi;

INF_PATH=$1
INF_BASENAME="$(basename "$INF_PATH")"

OUTDIR_PATH=${2:-"$(dirname "$INF_PATH")"}

# Get the dir path and the state prefix from the input path
#   E.G.: 
#     ../ga.201702-201706.inrix-schema.csv becomes ../ga
OUT_BASE_PATH="${OUTDIR_PATH}/${INF_BASENAME/\.*/}"

mkdir -p "${OUTDIR_PATH}"

if [ ! -f "$INF_PATH" ]; then
  echo "No file found at $INF_PATH."
  exit 1
fi;

function getColNum {
  awk -F',' -v col="$1" 'NR==1{for (i=1; i<=NF; i++) if ($i==col) {print i;exit}}' "$INF_PATH"
}

TIMESTAMP_COL_NUM="$(getColNum measurement_tstamp)"

###### Preserve the header #####
YRMOS=$(awk -F, 'NR>1{ print substr($3,1,4) substr($3,6,2) }' "${INF_PATH}" | sort -u)

for yrmo in $YRMOS
do
  head -1 "${INF_PATH}" > "${OUT_BASE_PATH}.${yrmo}.inrix-schema.csv"
done

awk \
 -v col="${TIMESTAMP_COL_NUM}" \
 -v base="${OUT_BASE_PATH}." \
 -F, \
 'NR>1{print >> base substr($col,1,4) substr($col,6,2)".inrix-schema.csv"}' \
 "$INF_PATH"
