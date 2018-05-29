#!/bin/bash

set -e
set -a

export GZIP=-9

pushd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null

source ../../config/postgres.env

TSTAMP="$(date +'%s')"
OUTDIR="pm3.$TSTAMP"

mkdir -p "$OUTDIR"

SQL="
	SELECT schemaname || ' ' || tablename
		FROM pg_tables
		WHERE (
      (tablename LIKE 'pm3_%')
      AND
      (schemaname <> 'public')
		)
		ORDER BY schemaname, tablename
;"

psql -qtA -c "${SQL}" |
while read schemaname tablename ; do
  psql -c "COPY \"$schemaname\".$tablename TO STDOUT CSV HEADER;" |
  gzip \
    > "./$OUTDIR/$schemaname.$tablename.$TSTAMP.csv.gz"
done

tar cvf "$OUTDIR.tar" "$OUTDIR" >/dev/null 2>&1
rm -rf "$OUTDIR"

popd
