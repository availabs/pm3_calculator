#!/usr/bin/env node

const { through } = require('event-stream');

const csvOutputStream = outputCols => {
  let sentHeader = false;
  let line = new Array(outputCols.length);

  return through(
    function write(row) {
      if (!sentHeader) {
        this.emit('data', outputCols.join(',') + '\n');
        sentHeader = true;
      }

      for (let i = 0; i < outputCols.length; ++i) {
        const d = row[outputCols[i]];
        if (d !== null && Number.isFinite(+d)) {
          line[i] = d;
        } else if (d) {
          line[i] = d;
        } else {
          line[i] = '';
        }
      }

      this.emit('data', line.join(',') + '\n');
    },

    function end() {
      this.emit('end');
    }
  );
};

module.exports = csvOutputStream;
