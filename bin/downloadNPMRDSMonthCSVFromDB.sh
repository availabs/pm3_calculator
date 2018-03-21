#!/bin/bash

set -e
set -a

cd "$( dirname "${BASH_SOURCE[0]}" )"

source ../config/postgres.env

if [ -z "${STATE}" ]
then
  echo "USAGE: Specify STATE as a env variable."
  exit 1
fi

if [ -z "${YEAR}" ]
then
  echo "USAGE: Specify YEAR as a env variable."
  exit 1
fi

if [ -z "${MONTH}" ]
then
  echo "USAGE: Specify MONTH as a env variable."
  exit 1
fi

if [ "${MONTH}" -lt 1 -o "${MONTH}" -gt 12 ];
then
  echo "USAGE: MONTH must be in range [1, 12]"
  exit 1
fi

MM="$(printf '%02.f' "${MONTH}")"

SQL="
  SELECT
      tmc,
      date,
      epoch,
      travel_time_all_vehicles,
      travel_time_passenger_vehicles,
      travel_time_freight_trucks
    FROM \"${STATE,,}\".npmrds_y${YEAR}m${MM}
    ORDER BY tmc, date, epoch
"
# echo "${SQL}"
psql -c "COPY (${SQL}) TO STDOUT CSV HEADER"
