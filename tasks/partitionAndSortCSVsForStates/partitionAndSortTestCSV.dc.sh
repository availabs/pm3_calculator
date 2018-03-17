#!/bin/bash

cd "$( dirname "$0" )"

STATE='dc'
INF='/mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/inrix-downloads/dc/dc_y2017m02-y2018m02.inrix-download/District-of-Columbia-Feb2017-Feb2018.csv'
OUTDIR="../../etl/${STATE}/"

../../bin/partitionDataByMonth.sh "$INF" "$OUTDIR" "$STATE"

for f in ${OUTDIR}*
do
  ../../bin/sortINRIXDataCSV.sh "$f"
  rm -f "$f"
done
