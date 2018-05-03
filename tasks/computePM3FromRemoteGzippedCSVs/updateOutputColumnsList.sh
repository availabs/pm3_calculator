#!/bin/bash

set -e

PROJ_ROOT="$( dirname "${BASH_SOURCE[0]}" )/../../"
pushd "$PROJ_ROOT" > /dev/null

CALCULATOR_SCRIPT="$(readlink -e './index.js')"

DATA_DIR="$(readlink -f ./data/)"
mkdir -p "$DATA_DIR"

ORIG_PATH="${DATA_DIR}/ny_2017_mean_12.csv"
COLS_FILE_PATH="$(readlink -f ./utils/pm3OutputCols.json)"

function finish {
  if [ -f "$BACKUP_PATH" ]
  then
    mv "$BACKUP_PATH" "$ORIG_PATH"
  fi
}
trap finish exit

if [ -f "${ORIG_PATH}" ]
then
  BACKUP_PATH="${ORIG_PATH}.$(uuidgen)"
  mv "$ORIG_PATH" "$BACKUP_PATH"
fi

"$CALCULATOR_SCRIPT" --FULL=0 --STATE=ny --YEAR=2017 --TIME=12

HEADER="$(head -1 "$ORIG_PATH")"
COLS_JSON="[$(echo "$HEADER" | sed 's/^/"/; s/,/","/g; s/$/"/')]"

echo "${COLS_JSON}" > "$COLS_FILE_PATH"

popd > /dev/null
