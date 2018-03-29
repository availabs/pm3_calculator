#!/bin/bash

set -e

ETL_WORK_DIR="${1:-"$ETL_WORK_DIR"}"

if [ -z "$ETL_WORK_DIR" ]
then
  echo "USAGE: Specify ETL_WORK_DIR as a env variable or as the 1st cli argument."
  exit 1
fi

ETL_WORK_DIR=$(readlink -f "${ETL_WORK_DIR}")

if [ "$(ls -A "${ETL_WORK_DIR}")" ]
then
  echo "$(basename ETL_WORK_DIR) is not empty... skipping rm -rf"
else
  rm -rf "${ETL_WORK_DIR}"
fi

