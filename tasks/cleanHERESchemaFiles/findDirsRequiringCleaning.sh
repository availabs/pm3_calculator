#!/bin/bash

THIS_DIR="$(readlink -e "$( dirname "${BASH_SOURCE[0]}" )")"

DATA_DIR="${1:-"${THIS_DIR}/../../etl"}"
DATA_DIR="$(readlink -e "$DATA_DIR")"

pushd "$DATA_DIR" > /dev/null

for d in $(find . -name '*here-schema.sorted.csv.gz' -printf '%h\n' | sort -u)
do
  for f in $(find "$d" -name '*here-schema.sorted.csv.gz')
  do
    if [[ $(zcat "${f}" | grep ',0$' | head -1) ]]
    then
      "${THIS_DIR}/cleanDir.sh" "$d"
      break
    fi
  done
done

popd > /dev/null
