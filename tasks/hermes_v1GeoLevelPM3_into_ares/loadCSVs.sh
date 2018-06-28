#!/bin/bash

set -e
set -a

pushd "$( dirname "${BASH_SOURCE[0]}")" >/dev/null

. ../../config/postgres.env.hermes

find ./csv -type f -name '*.csv' |
  while read csvPath; do
    ../../bin/loadGeoLevelPM3Calculations.wrapper.js "${csvPath}" 
  done

popd >/dev/null
