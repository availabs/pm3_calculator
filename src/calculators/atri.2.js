/* eslint no-param-reassign: 0 */
/*
  CalculateATRI
  computes the ATRI score for a given tmc based on the inputted
  time aggregated speed, freeflow,
  aadt(+type), Distribution Factor,

*/
const _ = require('lodash');

const { getAadt } = require('./utils/aadtUtils');
const precisionRound = require('./utils/precisionRound');

const fmiKeyParser = /(\d{4})(\d{2})(\d{2})_(\d{1,2})/;

const DAYS_PER_MONTH = [365, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const trafficType2SpeedType = {
  '': '',
  singl: 'speedFT',
  combi: 'speedFT',
  truck: 'speedFT',
  pass: 'speedPV'
};
const trafficType2DelayType = _.mapValues(
  trafficType2SpeedType,
  v => `delayHrs${v.slice(-2)}`
);

const trafficTypes = Object.keys(trafficType2SpeedType);

const newSumNumObj = () => ({
  speed: { sum: 0, num: 0 },
  speedPV: { sum: 0, num: 0 },
  speedFT: { sum: 0, num: 0 }
});

const getSpeedSumsByMonthByHour = tmcFiveteenMinIndex => {
  const speedSumsByMonthByHour = Object.keys(tmcFiveteenMinIndex).reduce(
    (acc, fmiBinKey) => {
      const [, year, month, day, qtrHr] = fmiBinKey.match(fmiKeyParser);
      const hour = Math.floor(qtrHr / 4);
      const min = (qtrHr % 4) * 15;
      const dateString = `${year}-${month}-${day}T${hour}:${min}:00`;
      const dow = new Date(dateString).getDay();

      // exclude weekends
      if (dow === 0 || dow === 6) {
        return acc;
      }

      const m = +month;
      const h = +hour;

      acc[m] = acc[m] || [];
      acc[m][h] = acc[m][h] || newSumNumObj();

      const { speed, speedPV, speedFT } = tmcFiveteenMinIndex[fmiBinKey];

      acc[m][h].speed.sum += speed.reduce((sum, s) => sum + s, 0);
      acc[m][h].speed.num += speed.length;

      acc[m][h].speedPV.sum += speedPV.reduce((sum, s) => sum + s, 0);
      acc[m][h].speedPV.num += speedPV.length;

      acc[m][h].speedFT.sum += speedFT.reduce((sum, s) => sum + s, 0);
      acc[m][h].speedFT.num += speedFT.length;

      return acc;
    },
    []
  );

  // aggregate the monthly sums into the yearly
  speedSumsByMonthByHour[0] = speedSumsByMonthByHour.reduce(
    (acc, hourlySpeedSums) => {
      for (let hr = 0; hr < hourlySpeedSums.length; hr += 1) {
        const { speed, speedPV, speedFT } = hourlySpeedSums[hr];

        acc[hr] = acc[hr] || newSumNumObj();

        acc[hr].speed.sum += speed.sum;
        acc[hr].speed.num += speed.num;

        acc[hr].speedPV.sum += speedPV.sum;
        acc[hr].speedPV.num += speedPV.num;

        acc[hr].speedFT.sum += speedFT.sum;
        acc[hr].speedFT.num += speedFT.num;
      }

      return acc;
    },
    []
  );

  return speedSumsByMonthByHour;
};

const getAvgSpeedByMonthByHour = speedSumsByMonthByHour =>
  speedSumsByMonthByHour.map(hourlySpeedSums =>
    hourlySpeedSums.map(({ speed, speedPV, speedFT }) => ({
      speed: speed.sum / speed.num || null,
      speedPV: speedPV.sum / speedPV.num || null,
      speedFT: speedFT.sum / speedFT.num || null
    }))
  );

const getHoursOfDelayByMonthByHour = (avgSpeedByMonthByHour, freeflowSpeed) =>
  avgSpeedByMonthByHour.map(avgSpeedByHour =>
    avgSpeedByHour.map(({ speed, speedPV, speedFT }) => ({
      delayHrs: freeflowSpeed > speed ? freeflowSpeed - speed : 0,
      delayHrsPV: freeflowSpeed > speedPV ? freeflowSpeed - speedPV : 0,
      delayHrsFT: freeflowSpeed > speedFT ? freeflowSpeed - speedFT : 0
    }))
  );

const CalculateATRI_2 = ({
  tmcAttrs,
  tmcFiveteenMinIndex,
  trafficDistribution,
  freeflowSpeed,
  ffLabel
}) => {
  const { faciltype } = tmcAttrs;

  const speedSumsByMonthByHour = getSpeedSumsByMonthByHour(tmcFiveteenMinIndex);
  const avgSpeedByMonthByHour = getAvgSpeedByMonthByHour(
    speedSumsByMonthByHour
  );
  const hrsDelayByMonthByHour = getHoursOfDelayByMonthByHour(
    avgSpeedByMonthByHour,
    freeflowSpeed
  );

  const dirFactor = +faciltype > 1 ? 2 : 1;

  const atriMeasureByTrafficTypeAndMonth = trafficTypes.reduce(
    (acc, trafficType) => {
      const aadt = getAadt(tmcAttrs, trafficType);
      const dirAADT = aadt / dirFactor;

      for (let month = 0; month < hrsDelayByMonthByHour.length; month += 1) {
        const monthDirAADT = dirAADT * DAYS_PER_MONTH[month] / 365;

        const k = `atri${trafficType ? `_${trafficType}` : ''}${
          ffLabel ? `_${ffLabel}` : ''
        }_${month || 'total'}`;

        const hoursOfDelayByHour = hrsDelayByMonthByHour[month];

        const delayType = trafficType2DelayType[trafficType];

        acc[k] = precisionRound(
          hoursOfDelayByHour.reduce((sum, delaysBySpeedType, hour) => {
            const delay = delaysBySpeedType[delayType];
            return sum + delay * monthDirAADT * trafficDistribution[hour];
          }, 0),
          4
        );
      }

      return acc;
    },
    {}
  );

  return atriMeasureByTrafficTypeAndMonth;
};

module.exports = CalculateATRI_2;
