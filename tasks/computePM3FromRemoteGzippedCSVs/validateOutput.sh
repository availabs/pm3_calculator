#!/bin/bash

set -e

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

LOCAL_ARCHIVE_DIR="$(readlink -m '../../archive/')"

find "$LOCAL_ARCHIVE_DIR" -type f -name '*pm3*' |
sort |\
while read f;
do
	if ! gunzip -t "$f" 2>/dev/null; then
		echo "$(basename "$f") is corrupt"
	fi
done

popd > /dev/null
