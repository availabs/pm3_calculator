#!/usr/bin/env node

const { through } = require('event-stream');

const csvOutputStream = outputCols => {
  let sentHeader = false;

  return through(
    function write(row) {
      if (!sentHeader) {
        this.emit('data', outputCols.join(',') + '\n');
        sentHeader = true;
      }

      const line = [];

      for (let i = 0; i < outputCols.length; ++i) {
        const d = row[outputCols[i]];
        if (d !== null && Number.isFinite(+d)) {
          line.push(+d);
        } else if (d) {
          line.push(d);
        } else {
          line.push('');
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
