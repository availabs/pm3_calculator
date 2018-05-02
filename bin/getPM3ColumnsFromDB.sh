#!/bin/bash

#!/bin/bash

set -e
set -a

cd "$( dirname "${BASH_SOURCE[0]}" )"

source ../config/postgres.env

SQL="
  SELECT
      jsonb_pretty(
        jsonb_agg(column_name)
      )
    FROM information_schema.columns
    WHERE (
      (table_schema = 'public')
      AND
      (table_name = 'pm3')
      AND
      (column_name not like '\_%')
    )
  ;
"

psql -tA -c "${SQL}"
    

