#!/bin/bash

set -e

export GZIP=-9

pushd "$( dirname "${BASH_SOURCE[0]}" )/../../" > /dev/null

ssh lor find /mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/canonical-archive -regextype posix-extended -regex '.*[a-z]{2}\.2017\.here-schema.sorted.csv.gz' |\
sort |\
while read f;
do
	mm="$(ssh -n lor gunzip -c "$f" | head -2 | tail -1 | awk -F',' '{ print substr($2,5,2) }')"
	if [[ "$mm" == '01' ]]
	then
		export STATE="$(basename "$f" | cut -c1-2)"
		echo "$STATE"

		outf="archive/${STATE}/pm3-calculations/${STATE}.2017.pm3-calculations.mean_3.csv.gz"
		outd="$(dirname "$outf")"

		if [[ ! -d "$outd" ]]
		then
			mkdir -p "$outd"
		else
			continue
		fi

		(ssh -n lor gunzip -c "$f") | ./index.streaming.js | gzip > "$outf"
	fi
done

popd > /dev/null
