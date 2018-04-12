#!/bin/bash

set -e

export GZIP=-9
export YEAR=2017

STORAGE_HOST=lor
STORAGE_DIR='/mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/canonical-archive'

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

CSV_CREATOR="$(readlink -e '../../utils/hereSchemaDataStream.bash.gzip.sh')"
LOCAL_ARCHIVE_DIR="$(readlink -m '../../archive/')"
SEND_TO_RIT="$(readlink -e '../copyArchiveToRIT/scpToRIT.sh')"

TMPDIR=$(readlink -m '../../etl/tmp')
mkdir -p "$TMPDIR"
export TMPDIR

ssh -n "$STORAGE_HOST" find "$STORAGE_DIR" -type d -name '*here-schema*' |\
sort |\
while read d;
do
  STATE="$(basename "$(dirname "$d")")"

  months_ct="$(ssh -n "$STORAGE_HOST" "find '$d' -regextype posix-extended -regex '.*\/[a-z]{2}\.2017[0-1][0-9]\.here-schema.sorted.csv.gz' | wc -l")"

	# If we have all 12 months 
  if [[ "$months_ct" == 12 ]]
  then

    yr_file_path="${d}/${STATE}.2017.here-schema.sorted.csv.gz"

		if ! ssh -n "$STORAGE_HOST" stat "$yr_file_path" \> /dev/null 2\>\&1
		then

      WRK_DIR="${TMPDIR}/${STATE}-createYearly2017ForStatesWithFullYearMonthly"

      # Is another process currently working on this STATE? (The WRK_DIR directory is the lock.)
      if ! mkdir "$WRK_DIR" > /dev/null 2>&1
      then
        continue
      fi

  		echo "$STATE"
			
			scp "$STORAGE_HOST:${d}/${STATE}.2017*.here-schema.sorted.csv.gz" "$WRK_DIR"

			outd="${LOCAL_ARCHIVE_DIR}/${STATE}/here-schema/"
			mkdir -p "$outd"

			outf="${outd}/${STATE}.${YEAR}.here-schema.csv.gz"

			"$CSV_CREATOR" "$WRK_DIR" | gzip > "$outf"

			rm -f "${WRK_DIR}/${STATE}.2017"*".here-schema.sorted.csv.gz"
			rmdir "$WRK_DIR"

      export STATE
      "$SEND_TO_RIT"
		fi
  fi
done

popd > /dev/null
