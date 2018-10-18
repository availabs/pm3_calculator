#!/bin/bash

set -e

pushd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null

SQL="
  SELECT
      tmc,
      hpms.TED_SINGL AS hpms_ted_singl,
      hpms.TED_COMBI AS hpms_ted_combi,
      hpms.TED_TRUCK AS hpms_ted_truck,
      mv_singl.ted AS mv_ted_singl,
      mv_combi.ted AS mv_ted_combi,
      mv_truck.ted AS mv_ted_truck
    FROM hpms
      INNER JOIN mv_singl ON (Travel_Time_Code = tmc)
      INNER JOIN mv_combi USING (tmc)
      INNER JOIN mv_truck USING (tmc)
  ;
"

csvsql --table hpms,mv_singl,mv_combi,mv_truck \
  --query "${SQL}" \
  ./nys.hpms.2017.v6-withTED.csv \
  ./albany.singl.csv \
  ./albany.combi.csv \
  ./albany.truck.csv

popd >/dev/null
