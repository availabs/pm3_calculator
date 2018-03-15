### Preprocessing the INRIX CSVs

1. sort the data by (tmc, timestamp, datasource)

```
./utils/sortINRIXDataCSV.sh data/test.csv data/test.sorted.csv
```

2. convert to HERE schema

```
./index.preprocess.js < data/test.here-schema.sorted.csv

```

### index.streaming.js usage

```
./index.streaming.js < data/test.here-schema.sorted.csv > out.csv
```

To monitor rate:

```
date +'%H:%M:%S' && ./index.streaming.js < data/test.here-schema.sorted.csv > out.csv
```

then

```
watch 'wc -l out.csv'
```
