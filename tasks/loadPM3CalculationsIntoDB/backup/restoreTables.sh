#!/bin/bash

set -e
set -a

source ../../config/postgres.env.local

gunzip -c ./schema-only.dump.sql.gz | psql -v ON_ERROR_STOP=1 
gunzip -c ./pm3.dump.sql.gz         | psql -v ON_ERROR_STOP=1 
