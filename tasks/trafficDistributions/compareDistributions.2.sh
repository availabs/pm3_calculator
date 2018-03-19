#!/bin/bash

SQL='
  SELECT
      bin,
      (cattlab."120P04340_pct" - avail."120P04340_pct") * 100 AS diff
    FROM cattlab INNER JOIN avail USING (bin)
    ORDER BY bin
'

csvsql --table cattlab,avail \
  --query "${SQL}" \
  <(cat tmc_dists.header; tail -n+2 ./tmc_dists.cattlab.csv) \
  <(cat tmc_dists.header; tail -n+2 ./tmc_dists_with_dow_adj.csv)
