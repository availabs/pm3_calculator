const fiveteenMinIndexer = (tmcAttr, tmcData, options) =>
  Array.isArray(tmcData)
    ? tmcData.reduce((output, current) => {
        const { SPEED_FILTER } = options || {};

        const date = current.npmrds_date || current.date;

        const tt = current.travelTime || current.travel_time_all_vehicles;

        const dateQtrHr = date + '_' + Math.floor(current.epoch / 3);

        const speed = +tmcAttr.length / (tt / 3600);

        // If SPEED_FILTER is not defined, this condition fails and we proceed.
        if (speed <= SPEED_FILTER) {
          return output;
        }

        if (!output[dateQtrHr]) {
          output[dateQtrHr] = { speed: [], tt: [] };
        }
        output[dateQtrHr].speed.push(speed);
        output[dateQtrHr].tt.push(tt);

        return output;
      }, {})
    : null;

module.exports = fiveteenMinIndexer;
