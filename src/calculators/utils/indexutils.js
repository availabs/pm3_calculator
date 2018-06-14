const speed = (index, key) => index[key].speed;
const speedPV = (index, key) => index[key].speedPV;
const speedFT = (index, key) => index[key].speedFT;
const tt = (index, key) => index[key].tt;
const ttPV = (index, key) => index[key].ttPV;
const ttFT = (index, key) => index[key].ttFT;

const getTT = (index, key, type) => {
  switch (type.toLowerCase()) {
    case "":
      return tt(index, key);
    case "singl":
    case "combi":
    case "truck":
      return ttFT(index, key);
    case "pass":
      return ttPV(index, key);
    default:
      return tt(index, key);
  }
};

module.exports = {
  speed,
  speedPV,
  speedFT,
  tt,
  ttPV,
  ttFT,
  getTT
};
