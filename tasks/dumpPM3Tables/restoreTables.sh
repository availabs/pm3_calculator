#!/bin/bash

set -e
set -a

source ../../config/postgres.env

psql -v ON_ERROR_STOP=1 -f ./schema-only.dump.sql
psql -v ON_ERROR_STOP=1 -f ./pm3.dump.sql
