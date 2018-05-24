/* eslint camelcase: 0 */

const { getAadt } = require('../../utils/aadtUtils');
const { getTT } = require('../../utils/indexutils');
const precisionRound = require('../../utils/precisionRound');

const DOW_ADJ_FACTORS = require('../constants/DOW_ADJ_FACTORS');

const getFifteenData = ({
  tmcAttributes,
  tmcFiveteenMinIndex,
  distroArray,
  trafficType,
  mean,
  time
}) =>
  Object.keys(tmcFiveteenMinIndex).map(key => {
    const { tmc } = tmcAttributes;
    const dirFactor = Math.min(tmcAttributes.faciltype, 2);

    const DirectionalAADT = getAadt(tmcAttributes, trafficType) / dirFactor;

    const ThresholdSpeed = Math.max(tmcAttributes.avg_speedlimit * 0.6, 20);

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

    const sumTT = getTT(tmcFiveteenMinIndex, key, trafficType).reduce(
      (a, b) => a + b
    );
    const hsumTT = getTT(tmcFiveteenMinIndex, key, trafficType).reduce(
      (a, b) => a + 1 / b,
      0
    );
    const hmeanTT = precisionRound(len / hsumTT, 0);
    const meanTT = precisionRound(sumTT / len, 0);

    const thresholdTravelTime = Math.round(
      tmcAttributes.length / ThresholdSpeed * 3600
    );

    let hmean_delay =
      hmeanTT > thresholdTravelTime
        ? Math.min(Math.round(hmeanTT) - thresholdTravelTime, 900) / 3600
        : null;

    let mean_delay =
      meanTT > thresholdTravelTime
        ? Math.min(Math.round(meanTT) - thresholdTravelTime, 900) / 3600
        : null;

    hmean_delay = precisionRound(hmean_delay, 4);
    mean_delay = precisionRound(mean_delay, 4);

    const dailyAADT = DirectionalAADT;
    const TrafficVolume = distroArray.map(
      d => d * dailyAADT * DOW_ADJ_FACTORS[dateTime.getDay()]
    );

    const fifteenMinuteVolumes =
      time === 12
        ? precisionRound(+TrafficVolume[parseInt(hour, 10)] / 4, 1)
        : precisionRound(+TrafficVolume[epoch], 1);

    let hmean_vehicle_delay = hmean_delay * fifteenMinuteVolumes;
    let mean_vehicle_delay = mean_delay * fifteenMinuteVolumes; // eslint-disable-line no-unused-vars

    hmean_vehicle_delay = precisionRound(hmean_vehicle_delay, 3);
    mean_vehicle_delay = precisionRound(mean_vehicle_delay, 3);

    return {
      tmc,
      dateTime,
      epoch,
      speedlimit: +tmcAttributes.avg_speedlimit,
      tt: mean === 'hmean' ? hmeanTT : meanTT,
      delay: mean === 'hmean' ? hmean_delay : mean_delay,
      vehicle_delay:
        mean === 'hmean' ? hmean_vehicle_delay : hmean_vehicle_delay // FIXME: always hmean
    };
  });

module.exports = getFifteenData;
