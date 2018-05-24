const arraySum = (data, key) => data.reduce((acc, c) => acc + +c[key], 0);

module.exports = arraySum;
