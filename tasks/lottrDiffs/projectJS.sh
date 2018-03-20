#!/bin/bash

SQL='
  SELECT
      tmc,
      js.lottr_am,
      js.lottr_off,
      js.lottr_pm,
      js.lottr_weekend
    FROM js
'

csvsql --table js \
  --query "${SQL}" \
  ./ny_2017_mean_3.csv


