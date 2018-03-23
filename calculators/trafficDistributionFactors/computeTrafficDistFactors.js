const AM_PEAK_START_EPOCH = 6 * 12;
const AM_PEAK_END_EPOCH = 10 * 12 - 1;

const PM_PEAK_START_EPOCH = (3 + 12) * 12;
const PM_PEAK_END_EPOCH = (7 + 12) * 12 - 1;

const FREEFLOW_AM_END_EPOCH = 5 * 12;
const FREEFLOW_PM_START_EPOCH = 22 * 12;

const computeTrafficDistFactors = data => {
  const combinedPeak = [0, 0];
  const amPeak = [0, 0];
  const pmPeak = [0, 0];
  const freeFlow = [0, 0];

  for (let i = 0; i < data.length; ++i) {
    const d = data[i];
    const { epoch } = d;

    const tt =
      d &&
      (d.travel_time_all_vehicles ||
        d.travel_time_passenger_vehicles ||
        d.travel_time_freight_trucks);

    if (tt) {
      if (epoch >= AM_PEAK_START_EPOCH && epoch < AM_PEAK_END_EPOCH) {
        ++combinedPeak[0];
        combinedPeak[1] += +tt;

        ++amPeak[0];
        amPeak[1] += +tt;
      } else if (epoch >= PM_PEAK_START_EPOCH && epoch < PM_PEAK_END_EPOCH) {
        ++combinedPeak[0];
        combinedPeak[1] += +tt;

        ++pmPeak[0];
        pmPeak[1] += +tt;
      } else if (
        epoch < FREEFLOW_AM_END_EPOCH ||
        epoch > FREEFLOW_PM_START_EPOCH
      ) {
        ++freeFlow[0];
        freeFlow[1] += +tt;
      }
    }
  }

  const combinedPeakAvgTT = combinedPeak[1] / combinedPeak[0];
  const amPeakAvgTT = amPeak[1] / amPeak[0];
  const pmPeakAvgTT = pmPeak[1] / pmPeak[0];
  const freeFlowAvgTT = freeFlow[1] / freeFlow[0];

  return {
    combinedPeakAvgTT,
    amPeakAvgTT,
    pmPeakAvgTT,
    freeFlowAvgTT
  };
};

module.exports = computeTrafficDistFactors;
