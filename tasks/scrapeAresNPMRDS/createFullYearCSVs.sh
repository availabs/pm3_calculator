#!/bin/bash

set -e

cd "$( dirname "$0" )"

if [ -z "$STATE" ]; then
  echo 'USAGE: specify the STATE by env variable.'
  exit 1
fi

export STATE

YEARS=$(ls -l "../../etl/${STATE}" | awk '{print substr($9, 4, 4)}' | sed '/^$/d' | sort -u)

for YEAR in ${YEARS[@]}
do
  export YEAR
  OUTF="../../etl/${STATE}/${STATE}.${YEAR}.here-schema.sorted.csv"

  if [ -f "${OUTF}" ]
  then
    echo "File exists... skipping $(realpath "${OUTF}")"
    continue
  fi

  time ../../utils/hereSchemaDataStream.bash.sh > "${OUTF}" &
done

wait
