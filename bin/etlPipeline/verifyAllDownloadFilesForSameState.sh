#!/bin/bash

set -e

ETL_WORK_DIR="${1:-"$ETL_WORK_DIR"}"
ETL_WORK_DIR="${ETL_WORK_DIR:="$(pwd)"}"

if [ ! -d "$ETL_WORK_DIR" ]
then
  echo "ERROR: Directory '${ETL_WORK_DIR}' does not exist"
  exit 1
fi

ETL_WORK_DIR="$( readlink -m "$ETL_WORK_DIR" )"

INRIX_DOWNLOAD_ZIP_EXTENSION="${INRIX_DOWNLOAD_ZIP_EXTENSION:=.inrix-download.zip}"

source "$( dirname "${BASH_SOURCE[0]}" )/stateAbbreviations.sh"

# Get the filenames of the downloaded ZIP archives
read -ra infs <<< "$(find "$ETL_WORK_DIR" -type f -name "*${INRIX_DOWNLOAD_ZIP_EXTENSION}" -printf '%f ')"

# Loop over the filenames, making sure that the state prefix of each file is the same
#  and matches the STATE env variable, if it was set.
for inf in "${infs[@]}"
do
  bname="$(basename "$inf")"
  cur_state="${bname/.*}"
  cur_state="${cur_state,,}"

  if [ -z "$cur_state" ]
  then
    echo "ERROR: unable to parse file name ${inf}"
    exit
  fi

  # https://stackoverflow.com/a/15394738/3970755
  if [[ ! " ${STATE_ABBREVIATIONS[@]} " =~ " ${cur_state} " ]];
  then
    echo "ERROR: unable to extract state name from file name ${inf}"
    exit
  fi

  if [[ ! -z "$prev_state" ]] && [[ "$prev_state" != "$cur_state" ]]
  then
    echo "ERROR: Invariant broken. More than one state's data in $ETL_WORK_DIR/"
    exit
  fi

  prev_state="$cur_state"
done

if [[ ! -z "$STATE" ]] && [[ "$STATE" != "$cur_state" ]]
then
  echo "ERROR: env variable STATE value '$STATE' does not equal state of data files '$cur_state'"
  exit 1
fi

# Set the state env variable, if this file was sourced
STATE="${cur_state}"
