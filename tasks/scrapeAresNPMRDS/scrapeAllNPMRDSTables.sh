#!/bin/bash

set -e
set -a

cd "$( dirname "$0" )"

cd ../../

source ./config/postgres.env.prod

SQL="
  SELECT
      'STATE=' || schemaname ||
      ' YEAR=' || substring(tablename from 9 for 4) ||
      ' MONTH=' || substring(tablename from 14 for 2) AS tbl
    FROM pg_tables
    WHERE (tablename LIKE '%npmrds_y%')
    ORDER BY tbl
;"

OUTPUT=$(psql --tuples-only -c "${SQL}")

echo "${OUTPUT}" |\
while read -r line ; do

  eval "${line}"

  export STATE
  export YEAR
  export MONTH

  mkdir -p "./etl/${STATE}/"

  time ./bin/downloadNPMRDSMonthCSVFromDB.sh \
    > "./etl/${STATE}/${STATE}.${YEAR}${MONTH}.here-schema.sorted.csv"
done

