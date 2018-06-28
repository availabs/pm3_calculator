const aadt = atts => +atts.aadt;
const aadtSingl = atts => +atts.aadt_singl;
const aadtCombi = atts => +atts.aadt_combi;
const aadtTruck = atts => aadtSingl(atts) + aadtCombi(atts);
const aadtPass = atts => aadt(atts) - aadtTruck(atts);

const getAadt = (atts, key) => {
  switch (key) {
    case "":
      return aadt(atts);
    case "singl":
      return aadtSingl(atts);
    case "combi":
      return aadtCombi(atts);
    case "truck":
      return aadtTruck(atts);
    case "pass":
      return aadtPass(atts);
  }
};

module.exports = {
  aadt,
  aadtSingl,
  aadtCombi,
  aadtTruck,
  aadtPass,
  getAadt
};
