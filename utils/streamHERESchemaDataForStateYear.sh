#!/bin/bash

if [ -z "$STATE" ]; then
  echo 'USAGE: specify the STATE by env variable.'
  exit 1
fi

if [ -z "$YEAR" ]; then
  echo 'USAGE: specify the YEAR by env variable.'
  exit 1
fi

cd "$( dirname "$0" )"

CSV_DIR="../etl/${STATE}"

if [ ! -d "$CSV_DIR" ]; then
  echo "ERROR: Directory $(realpath "$CSV_DIR") does not exist"
  exit 1
fi

CSV_FILES=(`find "${CSV_DIR}" -name "*${YEAR}*here-schema.sorted.csv" | sort`)

if [ -z "${CSV_FILES[0]}" ]; then
  echo "ERROR: No here-schema files in $(realpath "${CSV_DIR}") for ${YEAR}."
  exit 1
fi

# Omit header for all but first month's CSV
{ cat "${CSV_FILES[0]}"; for f in "${CSV_FILES[@]:1}"; do tail -n+2 "$f"; done; }
