function precisionRound(number, precision) {
  number = isNaN(number) ? 1 : number;
  number = number === Infinity ? 10 : number;
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}
module.exports = precisionRound;
