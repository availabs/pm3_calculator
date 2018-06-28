#!/bin/bash

set -e
set -a

pushd "$( dirname "${BASH_SOURCE[0]}")" >/dev/null

. ../../config/postgres.env

SQL="
  SELECT
      '\"' || schemaname || '\".' || tablename AS leaf_table
    FROM pg_tables
    WHERE (tablename LIKE 'geolevel_pm3%')
    ORDER BY 1
  ;
"

psql -t -c "$SQL" | sed '/^$/d' > geolevel_pm3_tables

popd >/dev/null
