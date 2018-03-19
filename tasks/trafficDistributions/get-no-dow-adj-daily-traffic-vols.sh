#!/bin/bash

csvsql --table dists \
  --query 'select substr(tstamp, 0, 4) as day, sum("120P04340"), sum("120N05397"), sum("120+14882"), sum("120-07060") from dists group by day order by min(bin)' <(cat tmc_dists.header; tail -n+2 tmc_dists_with_dow_adj.csv)
