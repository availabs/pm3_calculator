# Methodology

Note: Database and Calculator names are the machine hostnames, unless otherwise noted

## Databases

### ares
  * Production database
  * 2017 & 2018 data
  * Historically the canonical source for pm3_calculator data
  * Potential issues
    * Data has not been reloaded after INRIX/RITIS makes year's data "official"
      * 2017 & 2018 data updated monthly, and not reloaded after year's conflation made official.
      * RITIS has since told us that data and metadata not official until Autumn of the given year.

### hermes
  * Non-production database
  * 2018 data
  * Contains offical 2018 data and metadata

### mushin
  * Local development database
  * Subsets of 2017 and 2018 data
    * Subsets of ares database data.
      * subset_1: NY & NJ tmcs, mostly from G.W. Bridge, Holland Tunnel, Lincoln Tunnel
      * subset_2: TMC 120P04340 (Used previously to compare AVAIL PHED calculation with RITIS)

## Calculators

### lor
  * 2017 canonical calculator version
  * References tmc\_attributes table (not RITIS conflation-year versioned)

### ahimsa
  * New 2018 v0 calculator version
  * References tmc\_metadata\_<year> tables (RITIS conflation-year versioned)

### mushin
  * New 2018 v0 calculator version
  * References tmc\_metadata\_<year> tables (RITIS conflation-year versioned)

### npmrds4 client PHED Calcultor
  * Entirely diffent codebase.
  * References ares database

## Process

### HPMS Data Files
1. hpms-2017-v6
1. lor calculator pointed at ares database
  1. 2017
  1. 2018
1. ahimsa calculator pointed at hermes database
  1. 2018
1. mushin calculator pointed at mushin database
  1. 2017 (subset\_1)
  1. 2018 (subset\_1)
  1. 2017 (subset\_2)

### Other data sources

5. RITIS PHED calculation for 120P04340
6. npmrds4 PHED calculator for 120P04340

### Compare HPMS Data Files

NOTE: The following is from memory.

TODO: Verify

  1. 1 to 2.i
    * big PHED discrepancies
  1. 4.iii to 5
    * close
  1. 4.iii to 5
    * close
  1. 6 to 5
    * closer
  1. 2.ii to 3.i
    * most rows the same.
    * A few rows different
    * TODO: Take a closer look
  1. 2.i to 4.i
    * Same
  1. 2.ii to 4.ii
