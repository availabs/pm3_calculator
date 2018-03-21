#!/bin/bash

SQL='
  SELECT 
      CASE is_interstate
        WHEN 1 THEN "INTERSTATE"
        ELSE "NONINTERSTATE"
      END AS fsystem_type,
      ROUND(db_passing_len) AS db_passing_len,
      ROUND(db_total_len) AS db_total_len,
      ROUND(
          (db_passing_len * 1.0)
          /
          (db_total_len * 1.0)
          *
          100
        ,
        3
      ) AS pct_passing
    FROM (
      SELECT
          is_interstate,
          SUM(length) AS db_passing_len
        FROM db INNER JOIN js USING (tmc)
        WHERE (
          MAX(
            db.lottr_am_peak,
            db.lottr_midday,
            db.lottr_pm_peak,
            db.lottr_weekend
          ) < 1.5
        )
        GROUP BY is_interstate
    ) AS sub_passing INNER JOIN (
      SELECT
          is_interstate,
          SUM(length) AS db_total_len
        FROM db INNER JOIN js USING (tmc)
        GROUP BY is_interstate
    ) AS sub_total USING (is_interstate)
'

csvsql --table db,js \
  --query "${SQL}" \
  ./ares.lottr.ny.2017.csv \
  ./js.lottr.ny.2017.csv

