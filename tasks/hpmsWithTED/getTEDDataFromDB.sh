#!/bin/bash

set -e

SQL='
  SELECT
      tmc AS Travel_Time_Code,
      attrs.aadt,
      attrs.aadt_singl,
      attrs.aadt_combi,
      attrs.avg_vehicle_occupancy AS occ_fac,
      attrs.nhs_pct,
      vd_total AS phed,
      tvd_total AS ted,
      tvd_singl_total,
      tvd_combi_total,
      tvd_truck_total
    FROM ny.pm3_2017
      INNER JOIN ny.tmc_attributes AS attrs
      USING (tmc)
'

psql \
  -hares.availabs.org -p5432 -Unpmrds_ninja -dnpmrds_test \
  --c "COPY ($SQL) TO STDOUT WITH CSV HEADER"
