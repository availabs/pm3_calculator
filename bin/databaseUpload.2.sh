#!/bin/bash

set -e
set -a

CSV_PATH="$(realpath -e "$1")"
echo "$CSV_PATH"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

pushd "$DIR" > /dev/null

source ../config/postgres.env

TABLE_NAME="${TABLE_NAME:=pm3}"
INDEX_COLS="${INDEX_COLS:=tmc}"

FIELDS=$(head -n 1 "$CSV_PATH")

FILENAME=$(basename "$CSV_PATH")

STATE=${STATE:=${FILENAME%%_*}}
NOSTATE=${FILENAME#*_}
YEAR=${YEAR:=${NOSTATE%%_*}}

ALTER_SQL="
  ALTER TABLE \"${STATE}\".${TABLE_NAME}_${YEAR}
    ALTER COLUMN _year_ SET DEFAULT ${YEAR},
    ALTER COLUMN _state_ SET DEFAULT '${STATE}';

  CREATE INDEX ${STATE}_${TABLE_NAME}_${YEAR}_index ON \"${STATE}\".${TABLE_NAME}_${YEAR} (${INDEX_COLS});
"

COPY_SQL="\copy \"${STATE}\".${TABLE_NAME}_${YEAR} (${FIELDS}) FROM '${CSV_PATH}' DELIMITER ',' CSV HEADER"

echo "$FILENAME"
# echo $COPY_SQL

python -W ignore ./databaseUpload.py --csv="$CSV_PATH" --meta="$2"

# Assume the schema exists for a state
psql -qxtA -c "$ALTER_SQL"
psql -qxtA -c "$COPY_SQL"

popd > /dev/null
