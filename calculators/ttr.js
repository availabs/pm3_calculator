let d3 = require("d3-array");
const precisionRound = require("./utils/precisionRound");
const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKENDS = [0, 6];

const CalculateTTR = function CalculateLottr(
  tmc,
  tmcFiveteenMinIndex,
  mean = "mean"
) {
  let months = {};
  var fifteenData = Object.keys(tmcFiveteenMinIndex).map((key, i) => {
    var epoch = key.split("_")[1];
    var hour = Math.floor(epoch / 4).toString();
    hour = hour.length === 1 ? "0" + hour : hour;
    var min = ((epoch % 4) * 15).toString();
    min = min.length === 1 ? "0" + min : min;
    var dateString = key.split("_")[0];
    var year = dateString.substring(0, 4);
    var month = dateString.substring(4, 6);
    var day = dateString.substring(6, 8);
    var yearMonthDay = year + "-" + month + "-" + day;
    var dateTime = new Date(yearMonthDay + "T" + hour + ":" + min + ":00");
    months[dateTime.getMonth()] = true;
    var sum_tt = tmcFiveteenMinIndex[key].tt.reduce((a, b) => (a += b));
    var hsum_tt = tmcFiveteenMinIndex[key].tt.reduce((a, b) => {
      return (a += 1 / b);
    }, 0);
    var len = tmcFiveteenMinIndex[key].tt.length;
    var hmean = hsum_tt;
    var mean = sum_tt;
    //mean = sum_tt / len

    return {
      dateTime,
      epoch,
      hmean,
      mean
    };
  });
  let monthvals = Object.keys(months).map(x => +x);
  monthvals.push("total");
  function numSort(a, b) {
    return +a - +b;
  }
  const lottr = scores =>
    precisionRound(d3.quantile(scores, 0.8) / d3.quantile(scores, 0.5));
  const tttr = scores =>
    precisionRound(d3.quantile(scores, 0.95), d3.quantile(scores, 0.5));

  let measures = monthvals.reduce((acc, m) => {
    let month_clause =
      m !== "total" ? d => d.dateTime.getMonth() === m : d => true;
    var amPeak = fifteenData
      .filter(d => {
        return (
          WEEKDAYS.includes(d.dateTime.getDay()) &&
          (d.epoch >= 24 && d.epoch < 40) &&
          month_clause(d)
        );
      })
      .map(d => d[mean])
      .sort(numSort);

    var offPeak = fifteenData
      .filter(d => {
        return (
          WEEKDAYS.includes(d.dateTime.getDay()) &&
          (d.epoch >= 40 && d.epoch < 64) &&
          month_clause(d)
        );
      })
      .map(d => d[mean])
      .sort(numSort);

    var pmPeak = fifteenData
      .filter(d => {
        return (
          WEEKDAYS.includes(d.dateTime.getDay()) &&
          (d.epoch >= 64 && d.epoch < 80) &&
          month_clause(d)
        );
      })
      .map(d => d[mean])
      .sort(numSort);

    var weekendPeak = fifteenData
      .filter(d => {
        return (
          WEEKENDS.includes(d.dateTime.getDay()) &&
          (d.epoch >= 24 && d.epoch < 80) &&
          month_clause(d)
        );
      })
      .map(d => d[mean])
      .sort(numSort);

    var overnightPeak = fifteenData
      .filter(d => {
        return (
          WEEKDAYS.includes(d.dateTime.getDay()) &&
          (d.epoch < 24 || d.epoch > 80) &&
          month_clause(d)
        );
      })
      .map(d => d[mean])
      .sort(numSort);
    acc["lottr"] = acc["lottr"] || {};
    acc["tttr"] = acc["tttr"] || {};

    acc["lottr"][`lottr_am_${m}`] = lottr(amPeak);
    acc["lottr"][`lottr_off_${m}`] = lottr(offPeak);
    acc["lottr"][`lottr_pm_${m}`] = lottr(pmPeak);
    acc["lottr"][`lottr_weekend_${m}`] = lottr(weekendPeak);

    acc["tttr"][`tttr_am_${m}`] = tttr(amPeak);
    acc["tttr"][`tttr_off_${m}`] = tttr(offPeak);
    acc["tttr"][`tttr_pm_${m}`] = tttr(pmPeak);
    acc["tttr"][`tttr_weekend_${m}`] = tttr(weekendPeak);
    acc["tttr"][`tttr_overnight_${m}`] = tttr(overnightPeak);

    return acc;
  }, {});
  //console.log('overnightPeak')
  //console.log(overnightPeak)
  //console.log(d3.quantile(overnightPeak, 0.95 ), d3.quantile(overnightPeak, 0.5),d3.quantile(overnightPeak, 0.8 ) / d3.quantile(overnightPeak, 0.5))
  // var someData = fifteenData
  // 	.map(d => d[mean])
  // 	.sort()

  // someData = offPeak
  // console.log(JSON.stringify(someData))
  // console.log('-------------------------')
  // console.log('extent', d3.extent(someData))
  // console.log('mean', d3.mean(someData))
  // console.log('median', d3.median(someData))
  // console.log('variance', d3.variance(someData))
  // console.log('deviation', d3.deviation(someData))
  // console.log('-------------------------')

  // console.log('am', d3.quantile(amPeak, 0.5), d3.quantile(amPeak, 0.8 ), d3.quantile(amPeak, 0.8 ) / d3.quantile(amPeak, 0.5))
  // console.log('off', d3.quantile(offPeak, 0.5), d3.quantile(offPeak, 0.8 ), d3.quantile(offPeak, 0.8 ) / d3.quantile(offPeak, 0.5))
  // console.log('pm', d3.quantile(pmPeak, 0.5), d3.quantile(pmPeak, 0.8 ), d3.quantile(pmPeak, 0.8 ) / d3.quantile(pmPeak, 0.5))
  // console.log('weekend', d3.quantile(weekendPeak, 0.5), d3.quantile(weekendPeak, 0.8 ) ,d3.quantile(weekendPeak, 0.8 ) / d3.quantile(weekendPeak, 0.5))

  return {
    ...measures
    // lottr: {
    //   lottr_am: precisionRound(
    //     d3.quantile(amPeak, 0.8) / d3.quantile(amPeak, 0.5),
    //     2
    //   ),
    //   lottr_off: precisionRound(
    //     d3.quantile(offPeak, 0.8) / d3.quantile(offPeak, 0.5),
    //     2
    //   ),
    //   lottr_pm: precisionRound(
    //     d3.quantile(pmPeak, 0.8) / d3.quantile(pmPeak, 0.5),
    //     2
    //   ),
    //   lottr_weekend: precisionRound(
    //     d3.quantile(weekendPeak, 0.8) / d3.quantile(weekendPeak, 0.5),
    //     2
    //   )
    // },
    // tttr: {
    //   tttr_am: precisionRound(
    //     d3.quantile(amPeak, 0.95) / d3.quantile(amPeak, 0.5),
    //     2
    //   ),
    //   tttr_off: precisionRound(
    //     d3.quantile(offPeak, 0.95) / d3.quantile(offPeak, 0.5),
    //     2
    //   ),
    //   tttr_pm: precisionRound(
    //     d3.quantile(pmPeak, 0.95) / d3.quantile(pmPeak, 0.5),
    //     2
    //   ),
    //   tttr_overnight: precisionRound(
    //     d3.quantile(overnightPeak, 0.95) / d3.quantile(overnightPeak, 0.5),
    //     2
    //   ),
    //   tttr_weekend: precisionRound(
    //     d3.quantile(weekendPeak, 0.95) / d3.quantile(weekendPeak, 0.5),
    //     2
    //   )
    // }
  };
};
module.exports = CalculateTTR;
