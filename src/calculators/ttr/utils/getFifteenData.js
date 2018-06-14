const getFifteenData = (tmcFiveteenMinIndex, months) =>
  Object.keys(tmcFiveteenMinIndex).map(key => {
    const epoch = key.split('_')[1];

    let hour = Math.floor(epoch / 4).toString();
    hour = hour.length === 1 ? `0${hour}` : hour;

    let min = ((epoch % 4) * 15).toString();
    min = min.length === 1 ? `0${min}` : min;

    const dateString = key.split('_')[0];
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const yearMonthDay = `${year}-${month}-${day}`;

    const dateTime = new Date(`${yearMonthDay}T${hour}:${min}:00`);
    months.add(dateTime.getMonth());

    const sumTT = tmcFiveteenMinIndex[key].tt.reduce((a, b) => a + +b, 0);
    const hsumTT = tmcFiveteenMinIndex[key].tt.reduce((a, b) => a + 1 / +b, 0);
    const len = tmcFiveteenMinIndex[key].tt.length;
    const hmean = len / hsumTT;
    const mean = sumTT / len;

    return {
      dateTime,
      epoch,
      hmean,
      mean
    };
  });

module.exports = getFifteenData;
