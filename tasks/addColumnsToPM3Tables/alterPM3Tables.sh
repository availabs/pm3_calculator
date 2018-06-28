#!/bin/bash

set -e
set -a

if [ -z "$1" ]; then
  echo 'Specify the SQL file via the 1st cli argument'
  exit 1
fi

SQL_FILE="$( readlink -f "$1" )"

if [ ! -f pm3_tables ]; then
  echo 'Create the pm3_tables list file using getPM3Tables.sh'
  exit 1
fi

SQL="$(cat "$SQL_FILE")"

pushd "$( dirname "${BASH_SOURCE[0]}")" >/dev/null

. ../../config/postgres.env

while read tablename; do

  sed "s/__TABLE_NAME__/$tablename/g" <<< "$SQL" |
    PGOPTIONS='--client-min-messages=warning' psql --quiet

done < ./pm3_tables

popd >/dev/null
