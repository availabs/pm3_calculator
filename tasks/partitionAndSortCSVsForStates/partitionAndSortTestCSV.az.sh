#!/bin/bash

cd "$( dirname "$0" )"

INF='/mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/inrix-downloads/az/az_y2017m02-y2018m02.inrix-download/Arizona-Feb2017-Feb2018.csv'
OUTDIR='../../etl/az/'

../../bin/partitionDataByMonth.sh "$INF" "$OUTDIR" az

for f in ${OUTDIR}*
do
  ../../bin/sortINRIXDataCSV.sh "$f"
  rm -f "$f"
done
