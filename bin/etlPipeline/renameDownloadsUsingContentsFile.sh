#!/bin/bash

set -e

ETL_WORK_DIR="$( readlink -f "${1:-"$ETL_WORK_DIR"}" )"

if [ -z "$ETL_WORK_DIR" ]
then
  echo "USAGE: Specify ETL_WORK_DIR as a env variable or as the 2nd cli arg"
  exit 1
fi

INRIX_DOWNLOAD_ZIP_EXTENSION="${INRIX_DOWNLOAD_ZIP_EXTENSION:=.inrix-download.zip}"

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

source ./stateAbbreviations.sh
source ./datasources.sh

for state_name in "${!STATE_ABBREVIATIONS[@]}"
do
  state_name_regex="${state_name_regex}${state_name}|"
done

state_name_regex="${state_name_regex/%\|/}"

find "$ETL_WORK_DIR" -type f -name "*${INRIX_DOWNLOAD_ZIP_EXTENSION}" |\
while read inf 
do
  contents="$(unzip -c "$inf" Contents.txt)"

  # Extract the part of the description that is '<State Name> (<Number> TMCs)'
  # Remove ' (<Number> TMCs)'
  state_name="$( echo "$contents" | grep -Eoiw "$state_name_regex" )"
  state_name="${state_name,,}" # To lower case

  state="${STATE_ABBREVIATIONS[${state_name}]}"

  start_date="$(date -d "$(echo "$contents" | tr '\n' ' ' | sed 's/.*from //g; s/ through.*//g')" '+%Y%m')"
  end_date="$(date -d "$(echo "$contents" | tr '\n' ' ' | sed 's/.*through //')" '+%Y%m')"

  [[ "$start_date" != "$end_date" ]] \
    && date_range="${start_date}-${end_date}" \
    || date_range="$start_date"

  # https://stackoverflow.com/a/4594371/3970755
  datasources="$(\
    echo "$contents" |\
    grep -Po '\(Trucks\)|\(Passenger vehicles\)|\(Trucks and passenger vehicles\)' |\
    sort |\
    sed 's/(Trucks)/TRUCK/g; s/(Passenger vehicles)/PASS/g; s/(Trucks and passenger vehicles)/ALL/g;' |\
    tr '\n' '-'
  )"

  # Remove the last '-'
  datasources="$(echo "$datasources" | sed 's/.$//')"

  if [[ -z "$state" ]] || [[ -z "$date_range" ]] || [[ -z "$datasources" ]]
  then
    echo "Error parsing the Contents.txt for download at $inf"
    exit 1
  fi

  outf="$(dirname "$inf")/${state}.${date_range}.${datasources}${INRIX_DOWNLOAD_ZIP_EXTENSION}"

  if [ "$inf" != "$outf" ]
  then
    mv "$inf" "$outf"
  fi
done

popd > /dev/null
