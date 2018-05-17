#!/bin/bash

set -e
set -a

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "${DIR}/../../config/postgres.env"

pushd "$DIR" > /dev/null

echo "$DIR"

CSV_DIR="$(readlink -e ../../data/states)"

echo "$CSV_DIR"

CSV_UNIQUE_HEADERS="$(
  find "$CSV_DIR" -type f -name '*.csv' |\
  sort |\
  while read f;
  do
    head -1 "$f"
  done |
    sort -u
)"

if [[ $(echo "$CSV_UNIQUE_HEADERS" | wc -l) != 1 ]]; then
  echo 'ERROR: The headers in the CSVs are not uniform.'
  exit 1
fi

CSV_COLS="$(echo "$CSV_UNIQUE_HEADERS" | tr , '\n' | sort)"

SQL="
  SELECT 
      column_name
    FROM information_schema.columns
    WHERE (
      (table_name = 'geolevel_pm3')
      AND
      (table_schema = 'public')
    )
    ORDER BY column_name
  ;
"

DB_COLS="$(psql -t -c "$SQL")"

COLS_DIFF="$(
  diff --ignore-all-space --minimal <( echo "$CSV_COLS" ) <( echo "$DB_COLS" ) |
    grep -e '^<' |
    sed 's/^<//g;'
)"

if [[ -n "$(echo "$COLS_DIFF" | tr -d '[:space:]')" ]]; then
  ALTER_TABLE_SQL="ALTER TABLE geolevel_pm3 $(
    echo "$COLS_DIFF" |
      sed '
        s/^/  ADD COLUMN IF NOT EXISTS/g;
        s/$/ NUMERIC,/g;
        $s/,/\n;/g;'
    )"

  psql -c "$ALTER_TABLE_SQL"
fi

popd > /dev/null
