#!/bin/bash

SQL='
  SELECT 
      *
    FROM (
      SELECT
          COUNT(1) AS db_failing_ct
        FROM db
        WHERE (
          MAX(
            db.lottr_am_peak,
            db.lottr_midday,
            db.lottr_pm_peak,
            db.lottr_weekend
          ) >= 1.5
          AND
          (tmc IN (SELECT tmc FROM js))
        )
    ) CROSS JOIN (
      SELECT
          COUNT(1) AS js_failing_ct
        FROM js
        WHERE (
          MAX(
            js.lottr_am,
            js.lottr_off,
            js.lottr_pm,
            js.lottr_weekend
          ) >= 1.5
          AND
          (tmc IN (SELECT tmc FROM db))
        )
    )
'

csvsql --table db,js \
  --query "${SQL}" \
  ./ares.lottr.ny.2017.csv \
  ./js.lottr.ny.2017.csv

