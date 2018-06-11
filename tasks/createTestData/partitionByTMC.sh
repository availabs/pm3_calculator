#!/bin/bash

mkdir -p byTMC

xzcat albanyCountyNPMRDS.2017.csv.xz|tail -n+2 |  awk -F, -v OFS=, '{ print >> "byTMC/"$1".csv"; }'
