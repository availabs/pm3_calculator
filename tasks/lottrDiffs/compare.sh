#!/bin/bash

SQL='
  SELECT
      tmc,
      ROUND(db.lottr_am_peak, 4) AS db_am_peak,
      ROUND(db.lottr_midday, 4) AS db_midday,
      ROUND(db.lottr_pm_peak, 4) AS db_pm_peak,
      ROUND(db.lottr_weekend, 4) AS db_weekend,
      ROUND(js.lottr_am, 4) AS js_am_peak,
      ROUND(js.lottr_off, 4) AS js_midday,
      ROUND(js.lottr_pm, 4) AS js_pm_peak,
      ROUND(js.lottr_weekend, 4) AS js_weekend,
      ROUND((db.lottr_am_peak - js.lottr_am), 4) AS am_peak_diff,
      ROUND((db.lottr_midday - js.lottr_off), 4) AS off_peak_diff,
      ROUND((db.lottr_pm_peak - js.lottr_pm), 4) AS pm_peak_diff,
      ROUND((db.lottr_weekend - js.lottr_weekend), 4) AS pm_peak_diff
    FROM db INNER JOIN js USING (tmc)
    ORDER BY MAX(
      ABS(db.lottr_am_peak - js.lottr_am),
      ABS(db.lottr_midday - js.lottr_off),
      ABS(db.lottr_pm_peak - js.lottr_pm),
      ABS(db.lottr_weekend - js.lottr_weekend)
    ) DESC
    LIMIT 25
'

csvsql --table db,js \
  --query "${SQL}" \
  ./ares.lottr.ny.2017.csv \
  ./js.lottr.ny.2017.csv

