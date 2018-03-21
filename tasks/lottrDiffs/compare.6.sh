#!/bin/bash

SQL='
  SELECT 
      CASE is_interstate
        WHEN 1 THEN "INTERSTATE"
        ELSE "NONINTERSTATE"
      END AS fsystem_type,
      ROUND(db_passing_len) AS db_passing_len,
      ROUND(db_total_len) AS db_total_len,
      ROUND(js_passing_len) AS js_passing_len,
      ROUND(js_total_len) AS js_total_len,
      ROUND(
          (db_passing_len * 1.0)
          /
          (db_total_len * 1.0)
          *
          100
        ,
        3
      ) AS db_pct_passing,
      ROUND(
          (js_passing_len * 1.0)
          /
          (js_total_len * 1.0)
          *
          100
        ,
        3
      ) AS js_pct_passing
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
    ) AS sub_db_passing INNER JOIN (
      SELECT
          is_interstate,
          SUM(length) AS db_total_len
        FROM db INNER JOIN js USING (tmc)
        GROUP BY is_interstate
    ) AS sub_db_total USING (is_interstate) INNER JOIN (
      SELECT
          is_interstate,
          SUM(length) AS js_passing_len
        FROM js
        WHERE (
          MAX(
            js.lottr_am,
            js.lottr_off,
            js.lottr_pm,
            js.lottr_weekend
          ) < 1.5
        )
        GROUP BY is_interstate
    ) AS sub_js_passing USING (is_interstate) INNER JOIN (
      SELECT
          is_interstate,
          SUM(length) AS js_total_len
        FROM js
        GROUP BY is_interstate
    ) USING (is_interstate)
'

csvsql --table db,js \
  --query "${SQL}" \
  ./ares.lottr.ny.2017.csv \
  ./js.lottr.ny.2017.csv

