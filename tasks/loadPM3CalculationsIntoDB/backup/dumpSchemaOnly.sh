#!/bin/bash

set -e
set -a

source ../../../config/postgres.env

pg_dump --verbose --no-owner --schema-only --compress=9 --table='*.pm3*' \
  > "./pm3.dump.schema-only.sql.gz"
