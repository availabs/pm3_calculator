#!/bin/bash

set -e

if [ -z "${STATE}" ]
then
  echo "USAGE: Specify STATE as a env variable."
  exit 1
fi

if [ -z "${YEAR}" ]
then
  echo "USAGE: Specify YEAR as a env variable."
  exit 1
fi

[[ -z $MONTH ]] && MM='' || MM="$(printf '%02.f' "${MONTH}")"

scp "lor:/mnt/Data/pm3_calculator/etl/${STATE}/${STATE}.${YEAR}${MM}.here-schema.sorted.csv" /dev/stdout
