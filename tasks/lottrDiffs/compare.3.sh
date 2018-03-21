#!/bin/bash

SQL='
  SELECT 
      db_passing_ct,
      db_total_ct,
      ROUND(
          (db_passing_ct * 1.0)
          /
          (db_total_ct * 1.0)
          *
          100
        ,
        3
      ) AS pct_passing
    FROM (
      SELECT
          COUNT(1) AS db_passing_ct
        FROM db
        WHERE (
          MAX(
            db.lottr_am_peak,
            db.lottr_midday,
            db.lottr_pm_peak,
            db.lottr_weekend,
          ) < 1.5
          AND
          (tmc IN (SELECT tmc FROM js))
        )
    ) AS sub_passing CROSS JOIN (
      SELECT
          COUNT(1) AS db_total_ct
        FROM db
        WHERE (tmc IN (SELECT tmc FROM js))
    ) AS sub_total
'

csvsql --table db,js \
  --query "${SQL}" \
  ./ares.lottr.ny.2017.csv \
  ./js.lottr.ny.2017.csv

