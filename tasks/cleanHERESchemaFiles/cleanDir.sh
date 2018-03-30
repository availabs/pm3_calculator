#!/bin/bash

# This script will modify all *here-schema.sorted.csv.gz files
#   changing the travel time columns to null iff the travel time is zero.

# Use the highest level of compression
export GZIP=-9

DIR="${1:-"$(pwd)"}"

for inf in $(find "${DIR}" -regex '.*here-schema.sorted.csv.gz');
do 
  outf="${inf/csv/csv.cleaned}"

  # The following awk command will replace the data in the travel time columns
  #   with '' iff the travel time is zero.
  zcat "$inf" |\
  awk \
    -F',' \
    -v OFS=',' \
    '{ print $1, $2, $3, $4==0 ? "" : $4, $5==0 ? "" : $5, $6==0 ? "" : $6 }' |\
  gzip > "$outf"
  
  # Replace the original with the cleaned
  mv "$outf" "$inf"
done
