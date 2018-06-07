/* eslint no-restricted-syntax: 0 */

// http://2ality.com/2018/04/async-iter-nodejs.html

const csv = require('fast-csv');

async function* csvTMCDataGenerator(stream) {
  // const byTMCStream = pipeline(stream, csv(), tmcAggregator());
  let curTMC;
  let curTMCArr = [];

  const byTMCStream = stream.pipe(
    csv({
      headers: true,
      ignoreEmpty: true
    })
  );

  for await (const d of byTMCStream) {
    const { tmc } = d;

    Object.keys(d).forEach(k => {
      const v = d[k] !== '' ? d[k] : null;
      d[k] = v !== null && Number.isFinite(+v) ? +v : v;
    });

    if (curTMC !== tmc) {
      if (curTMCArr.length) {
        yield {
          metadata: { tmc: curTMC },
          data: curTMCArr
        };
      }
      curTMC = tmc;
      curTMCArr = [];
    } else {
      curTMCArr.push(d);
    }
  }

  if (curTMCArr.length) {
    yield {
      metadata: { tmc: curTMC },
      data: curTMCArr
    };
  }
}

module.exports = csvTMCDataGenerator;
