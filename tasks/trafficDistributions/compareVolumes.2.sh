#!/bin/bash

SQL='
  SELECT
      bin,
      (cattlab."120P04340" - avail."120P04340") AS vol_diff,
      (cattlab."120P04340_pct" * 100) AS cattlab_pct,
      (avail."120P04340_pct" * 100) AS avail_pct
    FROM cattlab INNER JOIN avail USING (bin)
    ORDER BY ABS(vol_diff) DESC
    LIMIT 100
'

csvsql --table cattlab,avail \
  --query "${SQL}" \
  <(cat tmc_dists.header; tail -n+2 ./tmc_dists.cattlab.csv) \
  <(cat tmc_dists.header; tail -n+2 ./tmc_dists_with_dow_adj.csv)
