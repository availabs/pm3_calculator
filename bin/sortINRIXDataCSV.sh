#!/bin/bash

if [ -z "$1" ]; then
  echo "USAGE: Specify the input csv file path as the first cli argument."
  exit 1
fi;

INF_PATH=$1

# Use optional second cli arg as output file path.
# If not provided, alter the input file path by adding 'sorted' before 'csv'.
OUTF_PATH=${2:-"${INF_PATH%csv}sorted.csv"}

if [ ! -f "$INF_PATH" ]; then
  echo "No file found at $INF_PATH."
  exit 1
fi;

if [ -f "$OUTF_PATH" ]; then
  echo "The output file ${OUTF_PATH} already exists."
  exit
fi;

# Preserve the header
head -1 "$INF_PATH" > "$OUTF_PATH"

function getColNum {
  awk -F',' -v col="$1" 'NR==1{for (i=1; i<=NF; i++) if ($i==col) {print i;exit}}' "$INF_PATH"
}

TMC_CODE_COL_NUM="$(getColNum tmc_code)"
TIMESTAMP_COL_NUM="$(getColNum measurement_tstamp)"
DATASOURCE_COL_NUM="$(getColNum datasource)"

# Sort the data
tail -n +2 "$INF_PATH" | \
  LC_ALL=C sort \
  -k"${TMC_CODE_COL_NUM},${TMC_CODE_COL_NUM}"\
  -k"${TIMESTAMP_COL_NUM},${TIMESTAMP_COL_NUM}"\
  -k"${DATASOURCE_COL_NUM},${DATASOURCE_COL_NUM}"\
  -t',' \
  -u >> "$OUTF_PATH"
