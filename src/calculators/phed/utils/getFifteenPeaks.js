// Peak Period is defined as weekdays
// from 6 a.m. to 10 a.m. and either 3 p.m.
// to 7 p.m. or 4 p.m. to 8 p.m. State DOTs
// and MPOs may choose whether to use
// 3 p.m. to 7 p.m. or 4 p.m. to 8 p.m.

//  6 * 4 = 24
// 10 * 4 = 40
// 15 * 4 = 60
// 19 * 4 = 76

const getFifteenPeaks = fifteenData =>
  fifteenData
    .map(d => {
      const out = Object.assign({}, d);

      // NOTE: Here, epoch means the 15min bin, not the 5 min NPMRDS bin.
      if (
        !((d.epoch >= 24 && d.epoch < 40) || (d.epoch >= 60 && d.epoch < 76))
      ) {
        out.tt = null;
        out.delay = null;
        out.vehicle_delay = null;
      }

      if (d.dateTime.getDay() === 0 || d.dateTime.getDay() === 6) {
        out.tt = null;
        out.delay = null;
        out.vehicle_delay = null;
      }

      return out;
    })
    .filter(d => d.vehicle_delay);

module.exports = getFifteenPeaks;
