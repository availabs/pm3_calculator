const getFifteenPeaks = fifteenData =>
  fifteenData
    .map(d => {
      const out = Object.assign({}, d);

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
