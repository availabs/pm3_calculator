#!/bin/bash

set -e

pushd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null

SQL="
  SELECT
      old.*,
      new.aadt_singl AS AADT_SINGL,
      new.aadt_combi AS AADT_COMBI,
      ROUND(new.tvd_singl_total * old.OCC_FAC, 2) AS TED_SINGL,
      ROUND(new.tvd_combi_total * old.OCC_FAC, 2) AS TED_COMBI,
      ROUND(new.tvd_truck_total * old.OCC_FAC, 2) AS TED_TRUCK
    FROM old INNER JOIN new USING (Travel_Time_Code)
  ;
"

csvsql --table old,new \
  --query "${SQL}" \
  ./nys.hpms.2017.v6.more-decimal-places.csv \
  ./nys.ted.2017.csv

popd >/dev/null
