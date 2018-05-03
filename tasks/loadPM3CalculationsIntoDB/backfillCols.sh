#!/bin/bash

set -e
set -a

source ../../config/postgres.env

pushd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null

SQL="
  UPDATE pm3
  SET 
    aadt_singl = att.aadt_singl,
    aadt_combi = att.aadt_combi,
    bounding_box = att.bounding_box,
    is_interstate = att.is_interstate
  FROM (
    SELECT
        tmc,
        aadt_singl,
        aadt_combi,
        bounding_box,
        (frc=1) AS is_interstate
      FROM tmc_attributes
  ) AS att
  WHERE (
    (pm3.tmc = att.tmc)
    AND
    (pm3.aadt_singl IS NULL)
  )
;
"

psql -c "$SQL"

popd >/dev/null
