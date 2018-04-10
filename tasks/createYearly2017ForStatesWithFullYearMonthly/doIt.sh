#!/bin/bash

set -e

export GZIP=-9
export YEAR=2017

STORAGE_HOST=lor
STORAGE_DIR='/mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/canonical-archive'

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

CSV_CREATOR="$(readlink -m '../../utils/hereSchemaDataStream.bash.gzip.sh')"
LOCAL_ARCHIVE_DIR="$(readlink -m '../../archive/')"

export TMPDIR=$(readlink -m '../../etl/tmp')

ssh -n "$STORAGE_HOST" find "$STORAGE_DIR" -type d -name '*here-schema*' |\
sort |\
while read d;
do
  state="$(basename "$(dirname "$d")")"

  months_ct="$(ssh -n "$STORAGE_HOST" "find '$d' -regextype posix-extended -regex '.*\/[a-z]{2}\.2017[0-1][0-9]\.here-schema.sorted.csv.gz' | wc -l")"

	# If we have all 12 months 
  if [[ "$months_ct" == 12 ]]
  then
    yr_file_path="${d}/${state}.2017.here-schema.sorted.csv.gz"

		if ! ssh -n "$STORAGE_HOST" stat "$yr_file_path" \> /dev/null 2\>\&1
		then
  		echo "Creating 2017 here-schema CSV for $state"
			
			WRK_DIR="${TMPDIR}/$(uuidgen)"
			
			mkdir -p "$WRK_DIR"

			scp "$STORAGE_HOST:${d}/${state}.2017*.here-schema.sorted.csv.gz" "$WRK_DIR"

			outd="${LOCAL_ARCHIVE_DIR}/${state}/here-schema/"
			mkdir -p "$outd"

			outf="${outd}/${state}.${YEAR}.here-schema.csv.gz"

			"$CSV_CREATOR" "$WRK_DIR" | gzip > "$outf"

			rm -f "${WRK_DIR}/${state}.2017"*".here-schema.sorted.csv.gz"
			rmdir "$WRK_DIR"
		fi
  fi
done

popd > /dev/null
