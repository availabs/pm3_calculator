#!/bin/bash

set -e

pushd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null

SQL="
  SELECT 
      directionality,
      congestion_level,
      road_type,
      day_type,
      MAX(pct_hrly) AS max_pct_hrly
    FROM cattlab_traffic_dists
    GROUP BY road_type, day_type, directionality, congestion_level
    ORDER BY directionality, road_type, max_pct_hrly DESC
  ;
"

csvsql --table cattlab_traffic_dists \
  --query "${SQL}" \
  ./CATTLabs_TrafficDistributions.translated.csv |
column -t -s','

popd >/dev/null
