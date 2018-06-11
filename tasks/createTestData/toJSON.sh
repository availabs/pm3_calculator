#!/bin/bash

tail -n+2 ./testData/albanyCountyNPMRDS.2017.subset.csv |
  jq -c -R '
      . |
      split(",") |
      {
        "tmc": .[0], 
        "date": .[1]|tonumber,
        "epoch": .[2]|tonumber,
        "travel_time_all_vehicles":  (if (.[3] != "") then .[3]|tonumber else null end),
        "travel_time_passenger_vehicles": (if (.[4] != "") then .[4]|tonumber else null end),
        "travel_time_freight_trucks": (if (.[5] != "") then .[5]|tonumber else null end)
     } 
  ' |
  jq --slurp -c . |
  xz -9 > ./testData/albanyCountyNPMRDS.2017.subset.json.xz
