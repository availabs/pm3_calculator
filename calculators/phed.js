/* eslint camelcase: 0 */
/* eslint no-use-before-define: 0 */
/* eslint prefer-destructuring: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-param-reassign: 0 */
/* eslint no-return-assign: 0 */
/* eslint no-restricted-properties: 0 */

const dayVolume = [0.8, 1.05, 1.05, 1.05, 1.05, 1.1, 0.9];
const { getAadt } = require('./utils/aadtUtils');
const { getTT } = require('./utils/indexutils');

const calculatePHED = function calculatePHED(
  tmcAttributes,
  tmcFiveteenMinIndex,
  distroArray,
  time = 12,
  mean = 'hmean'
) {
  const ttypes = ['', 'singl', 'combi', 'truck', 'pass'];
  const data = {};
  ttypes.forEach(tt => {
    const {
      vehicle_delay,
      delay,
      vehicle_delay_all,
      delay_all
    } = calculateAllPHED(
      tmcAttributes,
      tmcFiveteenMinIndex,
      distroArray,
      time,
      mean,
      tt
    );
    Object.assign(data, vehicle_delay, delay, vehicle_delay_all, delay_all);
  });
  return data;
};
const calculateAllPHED = function calculateAllPHED(
  tmcAttributes,
  tmcFiveteenMinIndex,
  distroArray,
  time = 12,
  mean = 'hmean',
  trafficType = ''
) {
  const ttlabel = trafficType.length ? `_${trafficType}` : '';
  const tmc = tmcAttributes.tmc;
  const dirFactor = +tmcAttributes.faciltype > 1 ? 2 : 1;
  const DirectionalAADT = getAadt(tmcAttributes, trafficType) / dirFactor;

  const distroData = distroArray.map((val, index) => ({
    hour: index,
    count: val
  }));
  // console.log('distro data', distroArray.reduce((a,b) => a + b ))
  const TestVolume = distroArray.map(d => d * DirectionalAADT);
  // console.log('TestVolume', TestVolume.reduce((a,b) => a + b ), DirectionalAADT)

  // tmcAttributes.avg_speedlimit = 45 // this is supid
  const ThresholdSpeed =
    +tmcAttributes.avg_speedlimit * 0.6 > 20
      ? +tmcAttributes.avg_speedlimit * 0.6
      : 20;

  const fifteenData = Object.keys(tmcFiveteenMinIndex).map((key, i) => {
    const epoch = key.split('_')[1];
    let hour = Math.floor(epoch / 4).toString();
    hour = hour.length === 1 ? `0${hour}` : hour;
    let min = ((epoch % 4) * 15).toString();
    min = min.length === 1 ? `0${min}` : min;
    const dateString = key.split('_')[0];
    const yearMonthDay = `${dateString.substring(0, 4)}-${dateString.substring(
      4,
      6
    )}-${dateString.substring(6, 8)}`;
    const dateTime = new Date(`${yearMonthDay}T${hour}:${min}:00`);
    const len = tmcFiveteenMinIndex[key].speed.length;
    // var sum_speed = tmcFiveteenMinIndex[key].speed.reduce((a, b) => (a += b));
    // var hsum_speed = tmcFiveteenMinIndex[key].speed.reduce((a, b) => {
    //   return (a += 1 / b);
    // }, 0);
    // var hmean_speed = precisionRound(len / hsum_speed, 2);
    // var mean_speed = precisionRound(sum_speed / len, 2);
    const sum_tt = getTT(tmcFiveteenMinIndex, key, trafficType).reduce(
      (a, b) => (a += b)
    );
    const hsum_tt = getTT(tmcFiveteenMinIndex, key, trafficType).reduce(
      (a, b) => (a += 1 / b),
      0
    );
    const hmean_tt = precisionRound(len / hsum_tt, 0);
    const mean_tt = precisionRound(sum_tt / len, 0);
    const threshold_travelTime = Math.round(
      tmcAttributes.length / ThresholdSpeed * 3600
    );
    const speedlimit_travelTime =
      tmcAttributes.length / +tmcAttributes.avg_speedlimit * 3600;
    let hmean_delay =
      hmean_tt > threshold_travelTime
        ? Math.min(Math.round(hmean_tt) - threshold_travelTime, 900) / 3600
        : null;
    let mean_delay =
      mean_tt > threshold_travelTime
        ? Math.min(Math.round(mean_tt) - threshold_travelTime, 900) / 3600
        : null;
    hmean_delay = precisionRound(hmean_delay, 4);
    mean_delay = precisionRound(mean_delay, 4);
    const days = ['Sun', 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat'];

    // Calculate Daily AADT then Disagregate
    // var dailyAADT = dayVolume[dateTime.getDay()] * DirectionalAADT
    // var TrafficVolume = distroArray.map(d => {return (d / 100) * dailyAADT})

    const dailyAADT = DirectionalAADT;
    const TrafficVolume = distroArray.map(
      d => d * dailyAADT * dayVolume[dateTime.getDay()]
    );

    const fifteenMinuteVolumes =
      time === 12
        ? precisionRound(+TrafficVolume[parseInt(hour)] / 4, 1)
        : precisionRound(+TrafficVolume[epoch], 1);

    // console.log('Traffic Volume', TrafficVolume)
    // console.log('fifteen Minute Volumes', fifteenMinuteVolumes)
    let hmean_vehicle_delay = hmean_delay * fifteenMinuteVolumes;
    let mean_vehicle_delay = mean_delay * fifteenMinuteVolumes;
    hmean_vehicle_delay = precisionRound(hmean_vehicle_delay, 3);
    mean_vehicle_delay = precisionRound(mean_vehicle_delay, 3);

    return {
      tmc,
      dateTime,
      epoch,
      speedlimit: +tmcAttributes.avg_speedlimit,
      tt: mean === 'hmean' ? hmean_tt : mean_tt,
      delay: mean === 'hmean' ? hmean_delay : mean_delay,
      vehicle_delay:
        mean === 'hmean' ? hmean_vehicle_delay : hmean_vehicle_delay
    };
  });

  let fifteenPeaks = fifteenData.map(d => {
    const out = Object.assign({}, d);
    if (!((d.epoch >= 24 && d.epoch < 40) || (d.epoch >= 60 && d.epoch < 76))) {
      out.tt = null;
      out.delay = null;
      out.vehicle_delay = null;
    }
    // if (!((d.epoch >= 24 && d.epoch< 40) ||  (d.epoch >= 60 && d.epoch < 80)) ) {
    //   out.vehicle_delay_bp = null
    //   out.vehicle_delay_bp = null
    // }

    if (d.dateTime.getDay() === 0 || d.dateTime.getDay() === 6) {
      out.tt = null;
      out.delay = null;
      out.vehicle_delay = null;
    }
    return out;
  });
  let fifteenTotal = fifteenData.map(x => Object.assign({}, x));
  // let analysis_data = fifteenPeaks.filter(d => d.vehicle_delay_bp)
  fifteenPeaks = fifteenPeaks.filter(d => d.vehicle_delay);
  fifteenTotal = fifteenTotal.filter(d => d.vehicle_delay);
  const delay = {};
  const vehicle_delay = {};
  const delay_all = {};
  const vehicle_delay_all = {};
  const array_sum = (data, accessor) =>
    data.reduce((acc, c) => acc + accessor(c), 0);

  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(month => {
    const raw_data = fifteenPeaks.filter(d => d.dateTime.getMonth() === month);
    const raw_all_data = fifteenTotal.filter(
      d => d.dateTime.getMonth() === month
    );

    const cur_delay = raw_data.reduce((out, curr) => {
      out += curr.delay;
      return out;
    }, 0);
    delay[`d${ttlabel}_${month + 1}`] = precisionRound(cur_delay, 3);

    const curr_vehicle_delay = raw_data.reduce((out, curr) => {
      out += curr.vehicle_delay;
      return out;
    }, 0);
    vehicle_delay[`vd${ttlabel}_${month + 1}`] = precisionRound(
      curr_vehicle_delay,
      3
    );

    const cur_all_delay = array_sum(raw_all_data, x => x.delay);
    const cur_all_vehicle_delay = array_sum(raw_all_data, x => x.vehicle_delay);
    const key = `${month + 1}`;
    delay_all[`td${ttlabel}_${key}`] = precisionRound(cur_all_delay, 3);
    vehicle_delay_all[`tvd${ttlabel}_${key}`] = precisionRound(
      cur_all_vehicle_delay,
      3
    );
  });
  const all_vehicle_delay = precisionRound(
    array_sum(fifteenTotal, x => x.vehicle_delay),
    3
  );
  const all_delay = precisionRound(array_sum(fifteenTotal, x => x.delay), 3);
  delay_all[`td${ttlabel}_total`] = all_delay;
  vehicle_delay_all[`tvd${ttlabel}_total`] = all_vehicle_delay;

  vehicle_delay[`vd${ttlabel}_total`] = precisionRound(
    fifteenPeaks.reduce((out, curr) => {
      out += curr.vehicle_delay;
      return out;
    }, 0),
    3
  );

  delay[`d${ttlabel}_total`] = precisionRound(
    fifteenPeaks.reduce((out, curr) => {
      out += curr.delay;
      return out;
    }, 0),
    3
  );

  // console.log(delay, vehicle_delay)

  return {
    delay,
    vehicle_delay,
    delay_all,
    vehicle_delay_all
  };
};

module.exports = calculatePHED;

function precisionRound(number, precision) {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}
