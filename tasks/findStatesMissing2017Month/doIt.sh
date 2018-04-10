#!/bin/bash

set -e

pushd "$( dirname "${BASH_SOURCE[0]}" )/../../" > /dev/null

ssh -n lor find /mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/canonical-archive -type d -name '*here-schema*' |\
sort |\
while read d;
do
  state="$(basename "$(dirname "$d")")"
  echo "$state"

  months_ct="$(ssh -n lor "find '$d' -regextype posix-extended -regex '.*\/[a-z]{2}\.2017[0-1][0-9]\.here-schema.sorted.csv.gz' | wc -l")"

  if [[ "$months_ct" != 12 ]]
  then
    echo "    WARNING: months_ct = $months_ct"
  fi
done

popd > /dev/null
