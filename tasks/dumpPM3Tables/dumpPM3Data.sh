#!/bin/bash

set -e
set -a

source ../../config/postgres.env

pg_dump --verbose --no-owner --clean --if-exists --table='*.pm3*' --exclude-table='*test*' | GZIP=-9 gzip > ./pm3.dump.sql.gz
