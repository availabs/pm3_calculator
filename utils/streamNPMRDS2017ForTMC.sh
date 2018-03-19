#!/bin/bash

set -e
set -a

cd "$( dirname "${BASH_SOURCE[0]}" )"

source ../config/postgres.env

THE_TMC=${TMC:-'120P04340'}

SQL="
  SELECT
      tmc,
      to_char(date, 'YYYYMMDD') AS date,
      epoch,
      travel_time_all_vehicles,
      travel_time_passenger_vehicles,
      travel_time_freight_trucks
    FROM npmrds
    WHERE (
      (tmc = '${THE_TMC}')
      AND
      (date >= '20170101'::DATE) AND (date < '20180101'::DATE)
    )
    ORDER BY date, epoch
"

psql -c "COPY (${SQL}) TO STDOUT CSV HEADER"
    
