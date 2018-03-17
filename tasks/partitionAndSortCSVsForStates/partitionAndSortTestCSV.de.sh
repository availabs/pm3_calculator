#!/bin/bash

cd "$( dirname "$0" )"

STATE='de'
INF='/mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/inrix-downloads/de/de_y2017m02-y2018m02.inrix-download/Delaware-Feb2017-Feb2018.csv'
OUTDIR="../../etl/${STATE}/"

../../bin/partitionDataByMonth.sh "$INF" "$OUTDIR" "$STATE"

for f in ${OUTDIR}*
do
  ../../bin/sortINRIXDataCSV.sh "$f"
  rm -f "$f"
done
