#!/bin/bash

set -e
set -a

source ../../../config/postgres.env

pg_dump --verbose --no-owner --data-only --compress=9 --table='*.pm3*' \
  > ./pm3.data-only.dump.sql.gz
