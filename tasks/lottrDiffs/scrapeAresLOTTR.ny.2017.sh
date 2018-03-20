#!/bin/bash

set -e
set -a

cd "$( dirname "${BASH_SOURCE[0]}" )"

source ../../config/postgres.env

SQL="
  SELECT
      tmc,
      lottr_am_peak,
      lottr_midday,
      lottr_pm_peak,
      lottr_weekend
    FROM lottr
    WHERE (
      (state = 'ny')
      AND
      (year = 2017)
      AND
      (month = '00')
    )
"

psql -c "COPY (${SQL}) TO STDOUT CSV HEADER"
