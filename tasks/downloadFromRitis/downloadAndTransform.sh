#!/bin/bash

pushd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null

cd ../../bin/etlPipeline

./main.sh "$1"

popd >/dev/null
