const csv = require('fast-csv');

const csvOutputStream = outputCols =>
  csv.createWriteStream({
    transform: function(obj) {
      return obj;
    },
    headers: outputCols
  });

module.exports = csvOutputStream;
