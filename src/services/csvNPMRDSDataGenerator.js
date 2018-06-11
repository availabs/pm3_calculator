// INVARIANT: TMC data contiguous
// INVARIANT: CSV contains a header

/* eslint no-restricted-syntax: 0 */
/* eslint consistent-return: 0 */
/* eslint no-param-reassign: 0 */

// See http://2ality.com/2018/04/async-iter-nodejs.html

const assert = require('assert');

async function* generateData({
  csvIterator,
  tmcs,
  head = Number.POSITIVE_INFINITY
}) {
  if (!csvIterator) {
    throw new Error('An csvIterator must be passed into generator');
  } else if (
    !(csvIterator[Symbol.iterator] || csvIterator[Symbol.asyncIterator])
  ) {
    // See http://2ality.com/2016/10/asynchronous-iteration.html
    throw new Error('The csvIterator is not iterable');
  }

  // If no tmcs were specifically requested, send all.
  const noTMCFilter = !tmcs;
  // Create a Set of the requested TMCs, if there were any.
  const reqTMCs = new Set(Array.isArray(tmcs) ? tmcs : [tmcs]);

  const pastTMCs = {};

  // used for partitioning output by TMC
  let prevTMC;
  let prevTMCData = [];

  let cols;
  let collectModeOn;

  // Asyncronously iterate over each row of the csv csvIterator
  for await (const d of csvIterator) {
    const { tmc } = d;

    // make sure the cols array has been initialized
    if (!cols) {
      cols = Object.keys(d);

      // Enforce the INVARIANT that the CSV has a header
      assert(cols.some(c => c.match(/tmc/i)));
    }
    // Note: for first encountered TMC, this condition is true
    if (prevTMC !== tmc) {
      if (prevTMC) {
        pastTMCs[prevTMC] = 1;
      }
      // Enforce invariant that the data for TMCs is contiguous
      assert(!pastTMCs[tmc]);

      // Remove the previous TMCs from the whitelist set
      reqTMCs.delete(prevTMC);

      // if the we have collected data for the previous TMC,
      //   it is time to send it to this generator's consumer.
      if (collectModeOn) {
        yield {
          metadata: { tmc: prevTMC },
          data: prevTMCData
        };

        head -= 1;
        // Can we terminate the generator?
        if (!(noTMCFilter || reqTMCs.size) || head < 0) {
          return;
        }
      }

      // update the prevTMC control var
      prevTMC = tmc;
      // assign a new array (reference) to the data collection array
      prevTMCData = [];

      // Set the flag on whether we are interested in the new TMC's data
      collectModeOn = noTMCFilter || reqTMCs.has(tmc);
    }

    // If this current TMC interests us, collect it's data.
    if (collectModeOn) {
      // For non-null columns, if they can be parsed as numbers, do so.
      for (let i = 0; i < cols.length; i += 1) {
        const c = cols[i];

        // if the value is an empty string, equivalent to null
        const v = d[c] !== '' ? d[c] : null;

        d[c] = v !== null && Number.isFinite(+v) ? +v : v;
      }

      // append this row from the CSV to the collection array.
      prevTMCData.push(d);
    }
  }

  // No more data coming in from the CSV.
  //   Were we collecting on the last TMC?
  //   If so, send it's data.
  if (collectModeOn) {
    yield {
      metadata: { tmc: prevTMC },
      data: prevTMCData
    };
  }
}

module.exports = { generateData };
