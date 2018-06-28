#!/usr/bin/env node

const { through } = require('event-stream');

const csvOutputStream = (outputCols, delineator = ',') => {
  let sentHeader = false;
  const line = new Array(outputCols.length);

  return through(
    function write(row) {
      if (!sentHeader) {
        this.emit('data', `${outputCols.join(delineator)}\n`);
        sentHeader = true;
      }

      for (let i = 0; i < outputCols.length; i += 1) {
        const d = row[outputCols[i]];
        if (d !== null && Number.isFinite(+d)) {
          line[i] = d;
        } else if (d) {
          line[i] = d;
        } else {
          line[i] = '';
        }
      }

      this.emit('data', `${line.join(delineator)}\n`);
    },

    function end() {
      this.emit('end');
    }
  );
};

module.exports = csvOutputStream;
