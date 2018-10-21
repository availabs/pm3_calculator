const getFifteenData = (tmcFiveteenMinIndex, months) =>
  Object.keys(tmcFiveteenMinIndex).map(key => {
    const epoch = key.split('_')[1];

    // NOTE: Epochs are 15 minutes here, NOT 5 min.
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

    // NOTE: Mutates the months parameter
    months.add(dateTime.getMonth());

    const sumTT = tmcFiveteenMinIndex[key].tt.reduce((a, b) => a + +b, 0);
    const hsumTT = tmcFiveteenMinIndex[key].tt.reduce((a, b) => a + 1 / +b, 0);
    const len = tmcFiveteenMinIndex[key].tt.length;
    const hmean = len / hsumTT;
    const mean = sumTT / len;

    const sumPV = tmcFiveteenMinIndex[key].ttPV.reduce((a, b) => a + +b, 0);
    const hsumPV = tmcFiveteenMinIndex[key].ttPV.reduce(
      (a, b) => a + 1 / +b,
      0
    );
    const lenPV = tmcFiveteenMinIndex[key].ttPV.length;
    const hmeanPV = lenPV / hsumPV;
    const meanPV = sumPV / lenPV;

    const sumFT = tmcFiveteenMinIndex[key].ttFT.reduce((a, b) => a + +b, 0);
    const hsumFT = tmcFiveteenMinIndex[key].ttFT.reduce(
      (a, b) => a + 1 / +b,
      0
    );
    const lenFT = tmcFiveteenMinIndex[key].ttFT.length;
    const hmeanFT = lenFT / hsumFT;
    const meanFT = sumFT / lenFT;

    return {
      dateTime,
      epoch,
      hmean,
      mean,
      hmeanPV,
      meanPV,
      hmeanFT,
      meanFT
    };
  });

module.exports = getFifteenData;
