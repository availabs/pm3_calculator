#!/bin/bash

set -e

pushd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null

mkdir -p ../meta

SQL="
  SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'pm3'
  ;
"

psql \
    -hares.availabs.org \
    -p5432 \
    -Unpmrds_ninja \
    -dnpmrds_test \
    --tuples-only \
    -c "$SQL" | 
  sed '/^\s*$/d' > ../meta/pm3Cols

popd >/dev/null
