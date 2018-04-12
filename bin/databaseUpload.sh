#!/bin/bash

set -e
set -a

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

pushd "$DIR" > /dev/null

source ../config/postgres.env

FIELDS=$(head -n 1 "$1")
FILENAME=$(basename "$1")
STATE=${FILENAME%%_*}
NOSTATE=${FILENAME#*_}
YEAR=${NOSTATE%%_*}

ALTER_SQL="
  ALTER TABLE \"${STATE}\".pm3_${YEAR}
    ALTER COLUMN _year_ SET DEFAULT ${YEAR},
    ALTER COLUMN _state_ SET DEFAULT '${STATE}';

  CREATE INDEX ${STATE}_pm3_${YEAR}_index ON \"${STATE}\".pm3_${YEAR} (tmc);
"

COPY_SQL="\copy \"${STATE}\".pm3_${YEAR} (${FIELDS}) FROM '${1}' DELIMITER ',' CSV HEADER"

echo "$FILENAME"
# echo $COPY_SQL

python -W ignore ./databaseUpload.py --csv="$1" --meta="$2"

# Assume the schema exists for a state
psql -qxtA -c "$ALTER_SQL"
psql -qxtA -c "$COPY_SQL"

popd > /dev/null
