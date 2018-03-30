#!/bin/bash

ETL_DIR="${1:-"$( dirname "${BASH_SOURCE[0]}" )/../../etl"}"
ETL_DIR="$(readlink -e "$ETL_DIR")"

find "$ETL_DIR" -type d |\
  awk '{ print length, $0 }' |\
  sort -rn |\
  cut -d' ' -f2- |\
while read d
do
  if [ "$(ls -A "$d")" ]
  then
    "$d is not empty... skipping rm -rf"
  else
    rm -rf "$d"
  fi

done

