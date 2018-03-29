const concat = (arr1, arr2) => {
  arr2.forEach(x => {
    arr1.push(x);
  });
};

module.exports = concat;
