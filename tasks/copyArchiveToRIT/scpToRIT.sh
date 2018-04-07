#!/bin/bash

# https://unix.stackexchange.com/questions/66154/ssh-causes-while-loop-to-stop

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ARCHIVE_DIR="$(readlink -f "${DIR}/../../archive/${STATE}")"

STORAGE_HOST=lor
STORAGE_DIR="/mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/canonical-archive/${STATE}"

find "$ARCHIVE_DIR" -type f |\
sort |\
while read abs_path
do
	base_name="$(basename "$abs_path")"

	archive_rel_path="${abs_path/${ARCHIVE_DIR}}"
	storage_path="${STORAGE_DIR}${archive_rel_path}"
	storage_dir="$(dirname "$storage_path")"

	# make sure the storage subdirectory exists on the remote server
	ssh -n "$STORAGE_HOST" "mkdir -p '$storage_dir'"

	# copy the file to storage
	scp "$abs_path" "${STORAGE_HOST}":"$storage_path"
	
	# If the file is a zip archive
	if [[ "$abs_path" == *.zip ]]
	then
		# test the integrity of the file in storage
		if ssh -n "$STORAGE_HOST" "unzip -t '$storage_path' > /dev/null 2>&1"
		then
			# If the integrity test passed, remove the local copy
			rm -f "$abs_path"
		else
			(>&2 echo "ERROR: integrity test failed for ${STORAGE_HOST}. Keeping local copy.")
		fi
	# if the file is a gzip archive
	elif [[ "$abs_path" == *.gz ]]
	then
		# test the integrity of the file in storage
		if ssh -n "$STORAGE_HOST" "gunzip -t '$storage_path' > /dev/null 2>&1"
		then
			# If the integrity test passed, remove the local copy
			rm -f "$abs_path"
		else
			(>&2 echo "ERROR: integrity test failed for ${STORAGE_HOST}. Keeping local copy.")
		fi
	else
		(>&2 echo "Unrecognized file format... ignoring $archive_rel_path")
	fi

done

# Remove all empty directories from the local archive dir
find "$ARCHIVE_DIR" -type d -empty -delete

