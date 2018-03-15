### index.streaming.js usage:

```
./index.streaming.js < data/nj_y2017m02.sorted.csv > out.csv
```

To monitor rate:

```
date +'%H:%M:%S' && ./index.streaming.js < data/nj_y2017m02.sorted.csv > out.csv
```

then

```
watch 'wc -l out.csv'
```
