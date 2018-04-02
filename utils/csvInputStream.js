#!/usr/bin/env node

const { through } = require('event-stream');

const csvInputStream = () => {
  let header;

  return through(
    function write(line) {
      if (!line) {
        return;
      }

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

module.exports = csvInputStream;
