#!/usr/bin/env node

const { through } = require('event-stream');

const tmcAggregator = () => {
  let curTMC;
  let curTMCArr;

  return through(
    function write(data) {
      const { tmc } = data;

      if (curTMC !== tmc) {
        if (curTMCArr) {
          this.emit('data', {
            metadata: { tmc: curTMC },
            data: curTMCArr
          });
        }
        curTMC = tmc;
        curTMCArr = [];
      }

      curTMCArr.push(data);
    },

    function end() {
      this.emit('data', {
        metadata: { tmc: curTMC },
        data: curTMCArr
      });
      this.emit('end');
    }
  );
};

module.exports = tmcAggregator;
