const getDateTime = key => {
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

module.exports = {
  fifteen: getDateTime
};
