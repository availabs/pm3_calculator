#!/bin/bash

set -e
set -a

pushd "$( dirname "${BASH_SOURCE[0]}")" >/dev/null

. ../../config/postgres.env

SQL="
  SELECT
      '\"' || schemaname || '\".' || tablename AS leaf_table
    FROM pg_tables
    WHERE (tablename LIKE 'pm3%')
    ORDER BY 1
  ;
"

psql -t -c "$SQL" | sed '/^$/d' > pm3_tables


popd >/dev/null
