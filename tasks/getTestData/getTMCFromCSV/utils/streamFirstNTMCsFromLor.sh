#!/bin/bash

# This script takes the following ENV variables:
#   * YEAR
#   * STATE
#   * TMC
#
# It will stream the NPMRDS data from the respective YEAR & STATE CSV in cold storage.
#   It uses the storage.arcc mount on lor.
#
# ASSUMES: Passwordless login set up between this script's host and lor
#   SEE: https://www.tecmint.com/ssh-passwordless-login-using-ssh-keygen-in-5-easy-steps/

set -e

pushd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null

if [[ -z $YEAR ]]; then
  echo 'The YEAR environment variable is required.'
  exit 1
fi

if [[ -z $STATE ]]; then
  echo 'The STATE environment variable is required.'
  exit 1
fi

if [[ -z $N ]]; then
  echo 'The N environment variable is required.'
  exit 1
fi

# STATE to lowercase
STATE="${STATE,,}"

# The path to the NPMRDS data CSV on LOR.
CSV_PATH="/mnt/RIT.samba/BACKUPS/INRIX-NPMRDS/canonical-archive/$STATE/here-schema/$STATE.$YEAR.here-schema.sorted.csv.gz"

AWK_SCRIPT='
  BEGIN {
    curTMC=""
    found=0
  }

  # Print the header
  NR == 1 { print }

  # Print the given TMCs data
  NR > 1 {
    if (curTMC != $1)
    {
      if(++found > N)
      {
        exit
      }

      curTMC = $1
    }
    print
  }
'

# Send the compressed CSV across the network
#  Uncompress locally
#  Print the header & the N TMCs' data,
#    ending the network stream after we've seen
#    all the TMCs' data.
ssh avail@lor.availabs.org "cat $CSV_PATH" |
  gunzip |
  awk -F, -vOFS=, -v N="$N" "$AWK_SCRIPT"

popd >/dev/null

