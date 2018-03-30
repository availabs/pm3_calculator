#!/bin/bash

STATE_DIR="${STATE_DIR:=$1}"
ETL_UUID="${ETL_UUID:=$2}"

STATE_DIR=$(readlink -f "$STATE_DIR")

if [ -z "$STATE_DIR" ]
then
  echo "USAGE: Specify STATE_DIR as a env variable or as the 1st cli arg."
  exit 1
fi

if [ -z "$ETL_UUID" ]
then
  echo "USAGE: Specify ETL_UUID as a env variable or as the 2nd cli arg."
  exit 1
fi

ETL_WORK_DIR="${ETL_WORK_DIR:=$(find "${STATE_DIR}" -type d -name "*${ETL_UUID}.etl-work-dir")}"

pushd "$ETL_WORK_DIR" > /dev/null

YRMOS=$(\
  ls -l \
  | tail -n+2 \
  | awk '{ print $NF }' \
  | awk -F'.' '{ print $2 }' \
  | grep -v "${ETL_UUID}" \
  | sort -nu \
)

MIN_MONTH="$(echo "$YRMOS" | head -1)"
MAX_MONTH="$(echo "$YRMOS" | tail -1)"

if [ "$MIN_MONTH" == "$MAX_MONTH" ]
then
  MONTH_RANGE="$MIN_MONTH"
else
  MONTH_RANGE="${MIN_MONTH}-${MAX_MONTH}"
fi

TO_RENAME=$(\
  find "${STATE_DIR}" -name "*${ETL_UUID}*" \
  | awk '{ print length, $0 }' \
  | sort -rn \
  | cut -d' ' -f2-\
)

for f in ${TO_RENAME[@]}
do
  a=$(basename "$f")
  b="${a//${ETL_UUID}/${MONTH_RANGE}}"

  if [ -f "${f/$a/$b}" ]
  then
    echo "$(basename "${f/$a/$b}") exists... removing $(basename "$f")"
    rm -f "$f"
    continue
  fi

  mv "$f" "${f/$a/$b}"
done

ETL_WORK_DIR="${ETL_WORK_DIR//"${ETL_UUID}"/"${MONTH_RANGE}"}"
DOWNLOADED_ZIP_PATH="${DOWNLOADED_ZIP_PATH//"${ETL_UUID}"/"${MONTH_RANGE}"}"

popd > /dev/null
