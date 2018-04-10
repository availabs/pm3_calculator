#!/bin/bash

set -e

pushd "$( dirname "${BASH_SOURCE[0]}" )/../../" > /dev/null

ssh lor find /mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/canonical-archive -regextype posix-extended -regex '.*[a-z]{2}\.2017\.here-schema.sorted.csv.gz' |\
sort |\
while read f;
do
  basename "$f"

  # Remove the 2017 Yearly CSV files that have 2018 data in them
  if ssh -n lor "gunzip -c '$f' | awk -F, '{print \$2}' | grep -q '2018'"
  then
    ssh -n lor "rm -f '$f'"
    echo "    Contains 2018: remove $f"
	fi

  # Remove the 2017 Yearly CSV files that do not have January
  if ! ssh -n lor "gunzip -c '$f' | awk -F, '{print \$2}' | grep -q '201701'"
  then
    echo "    No 201701: remove $f"
    ssh -n lor "rm -f '$f'"
	fi
done

popd > /dev/null
