const { spawn } = require('child_process');

// Get the CSV from the local cache
const getCSVFromLocalCacheStream = path =>
  spawn('xzcat', [path], {
    encoding: 'utf8'
  }).stdout;

module.exports = getCSVFromLocalCacheStream;
