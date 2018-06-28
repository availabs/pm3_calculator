#!/bin/bash

set -e
set -a

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

source "${DIR}/../../config/postgres.env"

pushd "$DIR" > /dev/null

STORAGE_HOST=lor
STORAGE_DIR='/mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/canonical-archive'

CSV_UNIQUE_HEADERS="$(
  ssh "$STORAGE_HOST" find "$STORAGE_DIR" -type f -name '*pm3-calculations*' |\
  sort |\
  while read f;
  do
    ssh -n "$STORAGE_HOST" cat "$f" |
      gunzip -c |
      head -1
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
      (table_name = 'pm3')
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
  ALTER_TABLE_SQL="ALTER TABLE pm3 $(
    echo "$COLS_DIFF" |
      sed '
        s/^/  ADD COLUMN IF NOT EXISTS/g;
        s/$/ NUMERIC,/g;
        $s/,/\n;/g;'
    )"

  psql -c "$ALTER_TABLE_SQL"
fi

popd > /dev/null
