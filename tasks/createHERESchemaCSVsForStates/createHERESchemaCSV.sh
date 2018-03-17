#!/bin/bash

if [ -z "$STATE" ]; then
  echo 'USAGE: specify the STATE by env variable.'
  exit 1
fi

cd "$( dirname "$0" )"

CSV_DIR="../../etl/${STATE}"

if [ ! -d "$CSV_DIR" ]; then
  echo "ERROR: Directory $(realpath "$CSV_DIR") does not exist"
  exit 1
fi

for inf in ${CSV_DIR}/*inrix-schema.sorted.csv
do
  outf=${inf/inrix/here}

  ../../bin/transformINRIXToHERESchema.js < "$inf" > "$outf" &
done

wait
