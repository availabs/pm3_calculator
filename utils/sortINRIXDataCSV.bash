#!/bin/bash

cd "$( dirname "${BASH_SOURCE[0]}" )"

INF_PATH=../data/test.csv
OUTF_PATH="${INF_PATH%csv}sorted.csv"

if [ ! -f $INF_PATH ]; then
  echo "USAGE: Specify the input csv file path with INF_PATH env variable."
  exit 1
fi;

if [ -f $OUTF_PATH ]; then
  echo "The output file ${OUTF_PATH} already exists."
  exit 1
fi;

function getColNum {
  awk -F',' -v col="$1" 'NR==1{for (i=1; i<=NF; i++) if ($i==col) {print i;exit}}' $INF_PATH
}

TMC_CODE_COL_NUM="$(getColNum tmc_code)"
TIMESTAMP_COL_NUM="$(getColNum measurement_tstamp)"
DATASOURCE_COL_NUM="$(getColNum datasource)"

# Preserve the header
head -1 $INF_PATH > $OUTF_PATH

# Sort the data
tail -n +2 $INF_PATH | \
  LC_ALL=C sort \
  -k"${TMC_CODE_COL_NUM},${TMC_CODE_COL_NUM}"\
  -k"${TIMESTAMP_COL_NUM},${TIMESTAMP_COL_NUM}"\
  -k"${DATASOURCE_COL_NUM},${DATASOURCE_COL_NUM}"\
  -t',' >> ${OUTF_PATH}
