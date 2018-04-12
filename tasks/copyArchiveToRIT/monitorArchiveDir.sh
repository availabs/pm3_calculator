#!/bin/bash

set -e

pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

ARCHIVE_DIR="$(readlink -f '../../archive/')"

inotifywait -m "$ARCHIVE_DIR" -e close_write |
    while read path action file; do
        ./scp2RIT.sh
    done
