// AMpeak: 6-9
// PMpeak: 4-7
const percentile = require('percentile');
const concat = require('./utils/concat');
const precisionRound = require('./utils/precisionRound');

const buildDateTime = key => {
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
  return dateTime;
};

const getDay = dt => dt.getDay();
const getTime = dt => dt.getHours();

const validDayTime = (dow, hr) =>
  (dow > 0 && dow <= 5 && ((hr >= 9 && hr < 16) || (hr >= 19 && hr < 22))) ||
  ((dow === 0 || dow === 6) && (hr >= 6 && hr < 22));

const validTime = datetime => validDayTime(getDay(datetime), getTime(datetime));

const CalculateFreeFlow = (tmcAtts = {}, tmcFifteenMinIndex) => {
  const { length } = tmcAtts;

  const TTs = Object.keys(tmcFifteenMinIndex);

  const totalTTs = TTs.reduce((acc, k) => {
    const tts = tmcFifteenMinIndex[k].tt;
    concat(acc, tts);
    return acc;
  }, []);

  const offPeakTTs = TTs.filter(k => {
    const datetime = buildDateTime(k);
    return validTime(datetime);
  }).reduce((acc, k) => {
    const tts = tmcFifteenMinIndex[k].tt;
    concat(acc, tts);
    return acc;
  }, []);

  const offPeakSpeeds = length
    ? TTs.filter(k => {
        const datetime = buildDateTime(k);
        return validTime(datetime);
      }).reduce((acc, k) => {
        const tts = tmcFifteenMinIndex[k].tt;
        const speeds = tts.map(tt => precisionRound(length / tt * 3600, 1));

        concat(acc, speeds);
        return acc;
      }, [])
    : null;

  const offPeakSpeedsHMean = length
    ? TTs.filter(k => {
        const datetime = buildDateTime(k);
        return validTime(datetime);
      }).reduce((acc, k) => {
        const tts = tmcFifteenMinIndex[k].tt;
        const speeds = tts.map(tt => length / tt * 3600);

        const hmean = speeds.length
          ? speeds.length / speeds.reduce((acc2, speed) => acc2 + 1 / speed, 0)
          : null;

        if (hmean) {
          acc.push(hmean);
        }
        return acc;
      }, [])
    : null;

  const freeflowUTT = percentile(30, totalTTs);
  const freeflowTT = percentile(15, offPeakTTs);

  const freeflowSpeed = offPeakSpeeds && percentile(85, offPeakSpeeds);
  const freeflowSpeedHMean =
    offPeakSpeedsHMean && percentile(85, offPeakSpeedsHMean);

  return {
    freeflowTT,
    freeflowUTT,
    freeflowSpeed,
    freeflowSpeedHMean
  };
};

module.exports = CalculateFreeFlow;
