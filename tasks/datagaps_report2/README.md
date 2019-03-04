# TMC Active Dates Analysis

## List all the raw download zip files:

COMMAND:
```bash
find . -type f -name '*raw-inrix-download*'
```

OUTPUT:
```bash
./ny.201812_etl/ny.201812.PASS.raw-inrix-download.zip
./ny.201812_etl/ny.201812.TRUCK.raw-inrix-download.zip
./ny.201812_etl/ny.201812.ALL.raw-inrix-download.zip
./ny.201805_etl/ny.201805.PASS.raw-inrix-download.zip
./ny.201805_etl/ny.201805.ALL.raw-inrix-download.zip
./ny.201805_etl/ny.201805.TRUCK.raw-inrix-download.zip
./nj.201801-12_etl/nj.201801-201812.PASS.raw-inrix-download.zip
./nj.201801-12_etl/nj.201801-201812.TRUCK.raw-inrix-download.zip
./nj.201801-12_etl/nj.201801-201812.ALL.raw-inrix-download.zip
./on.201801-12_etl/on.201801-201812.TRUCK.raw-inrix-download.zip
./on.201801-12_etl/on.201801-201812.ALL.raw-inrix-download.zip
./on.201801-12_etl/on.201801-201812.PASS.raw-inrix-download.zip
./ny.201803_etl/ny.201803.PASS.raw-inrix-download.zip
./ny.201803_etl/ny.201803.TRUCK.raw-inrix-download.zip
./ny.201803_etl/ny.201803.ALL.raw-inrix-download.zip
```

## Get all unique active_start_date and active_end_dates from across all TMC_Identification.csv files

COMMAND:
```bash
find . -type f -name '*raw-inrix-download*' |
  while read -r f; do
    unzip -p "$f" TMC_Identification.csv;
  done |
  awk -F, 'BEGIN{ OFS=","} { print $37, $38}' |
  column -t -s',' |
  sort -ru
```

OUTPUT:
```bash
active_start_date          active_end_date
2018-01-01 00:00:00-05:00  2019-01-01 00:00:00-05:00
```

## Conclusion
  The metadata states that all TMCs are active for the entirety of 2018.
