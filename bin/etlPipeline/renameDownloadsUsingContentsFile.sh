#!/bin/bash

set -e

ETL_WORK_DIR="$( readlink -f "${1:-"$ETL_WORK_DIR"}" )"

if [ -z "$ETL_WORK_DIR" ]
then
  echo "USAGE: Specify ETL_WORK_DIR as a env variable or as the 2nd cli arg"
  exit 1
fi

INRIX_DOWNLOAD_ZIP_EXTENSION="${INRIX_DOWNLOAD_ZIP_EXTENSION:=.raw-inrix-download.zip}"

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

source ./stateAbbreviations.sh
source ./datasources.sh

find "$ETL_WORK_DIR" -type f -name "*${INRIX_DOWNLOAD_ZIP_EXTENSION}" |\
while read -r inf 
do
  country_col_num="$(\
    unzip -p "$inf" TMC_Identification.csv |
      head -1 |
      tr ',' '\n' |
      nl |
      grep country |
      sed 's/^[[:blank:]]*//g; s/[[:blank:]].*//g'
  )"

  countries="$(
    unzip -p "$inf" TMC_Identification.csv |
      awk -F, "NR>1{ print tolower(\$${country_col_num}) }" |
      sort -u
  )"

  if grep -q 'usa' <<< "$countries"; then
    for state_name in "${!STATE_ABBREVIATIONS[@]}"
    do
      state_name_regex="${state_name_regex}${state_name}|"
    done

    contents="$(unzip -p "$inf" Contents.txt)"

    # Extract the part of the description that is '<State Name> (<Number> TMCs)'
    # Remove ' (<Number> TMCs)'
    state_name="$( echo "$contents" | grep -Eoiw "$state_name_regex" )"
    state_name="${state_name,,}" # To lower case
  else
    state_col_num="$(\
      unzip -p "$inf" TMC_Identification.csv |
        head -1 |
        tr ',' '\n' |
        nl |
        grep state |
        sed 's/^[[:blank:]]*//g; s/[[:blank:]].*//g'
    )"

    state_name="$(
      unzip -p "$inf" TMC_Identification.csv |
        awk -F, "NR>1{ print tolower(\$${state_col_num}) }" |
        sort -u
    )"
  fi

  ## RITIS breaks this rule. NY region downloads contain Canadian and New Jersey TMCs.
  ##   Had to weaken the test to looking only at the Contents file for US states.
  ##   Canadian provinces are downloaded by requesting specific TMCs.
  ##     The test is therefore stronger for them.
  if [ "$(wc -l <<< "$state_name")" -gt 1 ]; then
    echo 'ERROR: Downloads must contain data for a single state.'
    echo '       Multiple states listed in TMC_Identification.'
    exit 1
  fi

  if [[ "${#state_name}" -eq 2 ]]; then
    state="${state_name,,}"
  else
    state="${STATE_ABBREVIATIONS[${state_name}]}"
  fi

  contents="$(unzip -p "$inf" Contents.txt)"
  start_date="$(date -d "$(echo "$contents" | tr '\n' ' ' | sed 's/.*from //g; s/ through.*//g')" '+%Y%m')"
  end_date="$(date -d "$(echo "$contents" | tr '\n' ' ' | sed 's/.*through //')" '+%Y%m')"

  [[ "$start_date" != "$end_date" ]] \
    && date_range="${start_date}-${end_date}" \
    || date_range="$start_date"

  # https://stackoverflow.com/a/4594371/3970755
  datasources="$(
    echo "$contents" |
    grep -Po '\(Trucks\)|\(Passenger vehicles\)|\(Trucks and passenger vehicles\)' |
    sort |
    sed 's/(Trucks)/TRUCK/g; s/(Passenger vehicles)/PASS/g; s/(Trucks and passenger vehicles)/ALL/g;' |
    tr '\n' '-' |
    sed 's/-$//g'
  )"

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
