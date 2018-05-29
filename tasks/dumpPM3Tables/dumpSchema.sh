#!/bin/bash

set -e
set -a

source ../../config/postgres.env

pg_dump --verbose --no-owner --schema-only --dbname=npmrds_test | GZIP=-9 gzip > ./schema-only.dump.sql.gz
