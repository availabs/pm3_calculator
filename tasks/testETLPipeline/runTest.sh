#!/bin/bash

cd "$( dirname "${BASH_SOURCE[0]}" )"

STATE=etltest DOWNLOAD_LINK='http://localhost:8080/data.zip' ../../bin/etlPipeline/main.sh
