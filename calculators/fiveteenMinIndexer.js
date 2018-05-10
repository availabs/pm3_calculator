const fiveteenMinIndexer = (tmcAttr, tmcData, options) =>
  Array.isArray(tmcData)
    ? tmcData.reduce((output, current) => {
        const { SPEED_FILTER } = options || {};

        const date = current.npmrds_date || current.date;

        const tt = current.travelTime || current.travel_time_all_vehicles;
        const ttPV = current.travel_time_passenger_vehicles || tt;
        const ttFT = current.travel_time_freight_trucks || tt;
        const dateQtrHr = date + "_" + Math.floor(current.epoch / 3);

        const speed = +tmcAttr.length / (tt / 3600);
        const speedPV = +tmcAttr.length / (ttPV / 3600);
        const speedFT = +tmcAttr.length / (ttFT / 3600);

        // If SPEED_FILTER is not defined, this condition fails and we proceed.
        if (speed <= SPEED_FILTER) {
          return output;
        }

        if (!output[dateQtrHr]) {
          output[dateQtrHr] = {
            speed: [],
            speedPV: [],
            speedFT: [],
            tt: [],
            ttPV: [],
            ttFT: []
          };
        }
        output[dateQtrHr].speed.push(speed);
        output[dateQtrHr].speedPV.push(speedPV);
        output[dateQtrHr].speedFT.push(speedFT);
        output[dateQtrHr].tt.push(tt);
        output[dateQtrHr].ttPV.push(ttPV);
        output[dateQtrHr].ttFT.push(ttFT);
        return output;
      }, {})
    : null;

module.exports = fiveteenMinIndexer;
