#!/bin/bash

# Loop over the data CSVs included in the RITIS massive data downloader output,
#   outputting their contents to STDOUT as a single CSV.
#
# USAGE:
#   The 1st CLI arguement to this script is the list of ZIP archive paths.
#
# Output is the concatenated data CSVs.

# Import the NPMRDS_DATASOURCES associative array
source "$( dirname "${BASH_SOURCE[0]}")/datasources.sh"

# Specified as first command line arg, or defaults to STATE dir
ARCHIVE_PATHS="${1:-"$ARCHIVE_PATHS"}"

if [ -z "$ARCHIVE_PATHS" ]; then
  echo 'USAGE: specify the ARCHIVE_PATHS by env variable or 1st cli argument.'
  exit 1
fi

# https://nixshell.wordpress.com/2007/09/26/ifs-internal-field-separator/
oIFS=$IFS

IFS=', ' read -r -a ARCHIVES <<< "$ARCHIVE_PATHS"

IFS=$oIFS

# Parallell arrays used to collect information
ARCHIVE_ABSOLUTE_PATHS=()
ARCHIVE_DATASOURCES=()
ARCHIVE_DATA_FILE_NAMES=()
ARCHIVE_HEADERS=()

# Get the absolute paths for the ZIP archives and the name of each one's NPMRDS data file.
for f in "${ARCHIVES[@]}"
do
  abs_path="$(readlink -e "$f")"
  if [[ ! -f "$abs_path" ]]
  then
    echo "ERROR: No file at $f"
    exit 1
  fi

  ARCHIVE_ABSOLUTE_PATHS+=("$abs_path")

  # ASSUMPTION: the data file is the largest file in the downloaded archive.
  # The data.zip included multiple files. We need the name of the datafile.
  # This file name varies.
  # The following gets the filename of the largest csv file in the archive.
  data_file_name=$(\
    unzip -Zs "$abs_path" |\
    grep -i 'csv' |\
    sort -rn -k4,4 |\
    head -1 |\
    awk '{ print $NF }' \
  )

  ARCHIVE_DATA_FILE_NAMES+=("$data_file_name")

  header="$(unzip -p "$abs_path" "$data_file_name" | head -1)"

  # If the CSV has the datasource column, use the original header and set datasource to null
  if [[ "${header}" = *'datasource'* ]]
  then
    ARCHIVE_HEADERS+=("$header")
    ARCHIVE_DATASOURCES+=('')

  # If the CSV does not have a datasource column
  else
    # prepend the datasource column to the header
    ARCHIVE_HEADERS+=("datasource,${header}")

    # infer datasource type from the archive file name
    # Consider: We could also examine the Contents.txt file
    datasource="$(echo "$f" | grep -Eiow 'ALL|PASS|TRUCK')"
    datasource="${datasource^^}" # To upper case

    # If the archive file name does not contain the datasource type, we cannot proceed.
    if [[ -z "$datasource" ]]
    then 
      echo 'ERROR: Archive file names must include "ALL", "PASS", or "TRUCK" to indicate datasource.'
      exit 1
    fi

    # Set the datasource type for this archive file
    ARCHIVE_DATASOURCES+=("${NPMRDS_DATASOURCES["$datasource"]}")
  fi

done

# Make sure the CSVs are "UNION Compatable"
header0="${ARCHIVE_HEADERS[1]}"
for h in "${ARCHIVE_HEADERS[@]:1}"
do
  if [[ "$header0" != "$h" ]]
  then
    echo 'ERROR: The data file headers are not the same.'
    exit 1
  fi
done

# Output the header
echo "$header0"

# Loop over the data CSVs, outputting the contents
for i in "${!ARCHIVE_ABSOLUTE_PATHS[@]}";
do
  # If we need to add the datasource col, set ds_col to the necessary row 'prefix' of "<datasource>,"
  #   Otherwise set ds_col to an empty string
  [[ "${ARCHIVE_DATASOURCES["$i"]}" ]] && ds_col="${ARCHIVE_DATASOURCES["$i"]}," || ds_col=''

  # Pipe the data file to STDOUT
  # Remove the header
  # Add the datasource column, if required
  unzip -p "${ARCHIVE_ABSOLUTE_PATHS["$i"]}" "${ARCHIVE_DATA_FILE_NAMES["$i"]}" |\
    tail -n+2 |\
    awk "{ print \"${ds_col}\" \$0 }"
done

