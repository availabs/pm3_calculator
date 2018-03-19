#!/usr/bin/env node

const { env } = process;

const { spawn, spawnSync } = require('child_process');
const { readdirSync } = require('fs');
const { join } = require('path');

const { pipeline, pipe, each, from } = require('mississippi');
const { split, merge } = require('event-stream');

const toNumerics = o =>
  Object.keys(o).reduce((acc, k) => {
    acc[k] = Number.isFinite(+o[k]) ? parseFloat(o[k]) : o[k];
    return acc;
  }, {});

const { YEAR = 2017, STATE = 'nj' } = toNumerics(Object.assign({}, env));

const dataDir = join(__dirname, `../etl/${STATE}/`);

const SPITTER_REGEX = /(\n)/;
const NEWLINE = new Buffer('\n');

const mergeStreams = streams => {
  let curStream;
  let curTmc = new Buffer('xxxxxxxxx');

  const peeked = new Array(streams.length);
  const spent = new Array(streams.length);

  for (let i = 0; i < streams.length; ++i) {
    peeked[i] = [null, null];
  }
  spent.fill(false);

  const queue = [];

  function manageQueue() {
    if (!queue.length) {
      return;
    }

    // If not all active streams accounted for, await data
    for (let i = 0; i < streams.length; ++i) {
      if (spent[i]) {
        continue;
      } else if (!peeked[i][1]) {
        // Let the streams have the EventLoop
        return setTimeout(manageQueue, 0);
      }
    }

    curStream = null;
    for (let i = 0; i < streams.length; ++i) {
      if (!spent[i]) {
        curStream = i;
        break;
      }
    }

    if (curStream === null) {
      return queue.shift()(null, null);
    }

    // Assign curStream to the stream with the lowest (TMC, date)
    for (let i = curStream + 1; i < streams.length; ++i) {
      if (!spent[i] && Buffer.compare(peeked[curStream][0], peeked[i][0]) > 0) {
        curStream = i;
      }
    }

    let [peekedLine, peekedNext] = peeked[curStream];

    peekedLine.copy(curTmc, 0, 0, 9);

    peeked[curStream][0] = null;
    peeked[curStream][1] = null;

    // queue.shift()(null, Buffer.concat([peekedLine, NEWLINE]));
    queue.shift()(null, peekedLine);

    peekedNext();

    if (queue.length) {
      return manageQueue();
    }
  }

  const eachFn = i => (line, next) => {
    if (peeked[i][1]) {
      console.error('ASSERTION FAILURE: streams not syncronous on next');
      process.exit(1);
    }

    // console.error(i);
    if (!line) {
      console.error('ASSERTION FAILURE: line is empty');
      process.exit(1);
    }

    // Skip manage queue if we are draining current stream till TMC changes.
    if (i === curStream && queue.length && line.slice(0, 9).equals(curTmc)) {
      // queue.shift()(null, Buffer.concat([line, NEWLINE]));
      queue.shift()(null, line);
      return next();
    }

    peeked[i][0] = line.slice();
    peeked[i][1] = next;

    manageQueue();
  };

  const doneFn = i => err => {
    if (peeked[i][1]) {
      console.error('ASSERTION FAILURE: streams not syncronous on next');
      process.exit(1);
    }

    if (err) {
      console.error(err);
      process.exit(1);
    }
    spent[i] = true;
  };

  for (let i = 0; i < streams.length; ++i) {
    const e = eachFn(i);
    const d = doneFn(i);

    const p = pipeline(streams[i], split(SPITTER_REGEX));
    each(p, e, d);
  }

  return from(function(size, next) {
    if (
      peeked[curStream] &&
      peeked[curStream][0] &&
      peeked[curStream][0].slice(0, 9).equals(curTmc)
    ) {
      const [peekedLine, peekedNext] = peeked[curStream];
      peeked[curStream][0] = null;
      peeked[curStream][1] = null;

      queue.push(next);
      // queue.shift()(null, Buffer.concat([peekedLine, NEWLINE]));
      queue.shift()(null, peekedLine);

      peekedNext();
      return;
    }

    queue.push(next);
    manageQueue();
  });
};

const files = readdirSync(dataDir)
  .filter(f => f.match(new RegExp(YEAR)))
  .filter(f => f.match(/here-schema\.sorted\.csv/))
  .sort();

if (!files.length) {
  process.exit(0);
}

const { stdout: header } = spawnSync('head', ['-n1', join(dataDir, files[0])]);

const dataStreams = files.map(f => {
  const fpath = join(dataDir, f);
  const subprocess = spawn('tail', ['-n+2', fpath], { encoding: 'utf8' });

  subprocess.on('error', err => {
    console.error('ERROR: Failed to read', fpath);
    process.exit(1);
  });

  return subprocess.stdout;
});

// https://stackoverflow.com/a/15884508/3970755
process.stdout.on('error', function(err) {
  if (err.code == 'EPIPE') {
    process.exit(0);
  }
});

process.stdout.write(header);
mergeStreams(dataStreams).pipe(process.stdout);
