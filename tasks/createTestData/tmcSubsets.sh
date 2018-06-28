#!/bin/bash

mkdir -p testData

OUTF='testData/albanyCountyNPMRDS.2017.subset.csv'

# xzcat ./albanyCountyNPMRDS.2017.csv.xz | head -1 > "$OUTF"

# find ./byTMC -type f |
  # shuf -n 11 |
  # while read f; do
    # cat "$f" >> "$OUTF"
  # done

# gzip -9 < "$OUTF" > "$OUTF.gz"
# xz -9 < "$OUTF" > "$OUTF.xz"
zip -9 - "$OUTF" > "$OUTF.zip" 2>/dev/null
