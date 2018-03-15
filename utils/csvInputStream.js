#!/usr/bin/env node

const { split, through } = require('event-stream');
const { obj: pumpify } = require('pumpify');

const lineParser = () => {
  let header;

  return through(
    function write(line) {
      if (!header) {
        header = line.split(',');
        return;
      }

      const d = line.split(',');
      const row = {};

      for (let i = 0; i < header.length; ++i) {
        row[header[i]] = d[i];
      }

      this.emit('data', row);
    },

    function end() {
      this.emit('end');
    }
  );
};

const csvInputStream = () => pumpify(split(), lineParser());

module.exports = csvInputStream;
