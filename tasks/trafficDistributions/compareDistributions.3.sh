#!/bin/bash

SQL='
  SELECT
      distro_array.bin,
      (cattlab."120P04340_pct" * 100 - distro_array.pct) AS diff
    FROM cattlab INNER JOIN distro_array
      ON ((cattlab.bin - 96) = distro_array.bin)
    ORDER BY distro_array.bin
'

csvsql --table cattlab,distro_array \
  --query "${SQL}" \
  <(cat tmc_dists.header; tail -n+2 ./tmc_dists.cattlab.csv) \
  ./distroArray.csv
