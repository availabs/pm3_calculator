const percentile = require("percentile");
const concat = require("./utils/concat");

const buildDateTime = key => {
  var epoch = key.split("_")[1];
  var hour = Math.floor(epoch / 4).toString();
  hour = hour.length === 1 ? "0" + hour : hour;
  var min = ((epoch % 4) * 15).toString();
  min = min.length === 1 ? "0" + min : min;
  var dateString = key.split("_")[0];
  var yearMonthDay =
    dateString.substring(0, 4) +
    "-" +
    dateString.substring(4, 6) +
    "-" +
    dateString.substring(6, 8);
  var dateTime = new Date(yearMonthDay + "T" + hour + ":" + min + ":00");
  return dateTime;
};

const getDay = dt => dt.getDay();
const getTime = dt => dt.getHours();
const validDayTime = (d, t) =>
  (d > 0 && d < 5 && ((t >= 9 && t < 16) || (t >= 19 && t < 22))) ||
  ((d === 0 || d === 6) && (t >= 6 && t < 22));
const validTime = datetime => validDayTime(getDay(datetime), getTime(datetime));

const CalculateFreeFlow = (tmcAtts, tmcFifteenMinIndex) => {
  let TTs = Object.keys(tmcFifteenMinIndex);
  let totalTTs = TTs.reduce((acc, k) => {
    let tts = tmcFifteenMinIndex[k].tt;
    concat(acc, tts);
    return acc;
  }, []);
  let offPeakTTs = TTs.filter(k => {
    let datetime = buildDateTime(k);
    return validTime(datetime);
  }).reduce((acc, k) => {
    let tts = tmcFifteenMinIndex[k].tt;
    concat(acc, tts);
    return acc;
  }, []);

  let freeflowTT = percentile(30, totalTTs);
  let freeflowUTT = percentile(15, offPeakTTs);
  return {
    freeflowTT,
    freeflowUTT
  };
};

module.exports = CalculateFreeFlow;
