const stateRegExp = /^([A-Z]{2})\./i;
const yearRegExp = /^[A-Z]{2}\.(\d{4})\./i;
const tmcLevelPM3CalcVerRegExp = /tmcLevelVer-(.{1,})\.v/;
const geoLevelPM3CalcVerRegExp = /\.v(.{1,})\.csv$/;

const get = ({
  state,
  year,
  tmcLevelPM3CalcVer = 'unknown',
  geoLevelPM3CalcVer
}) => {
  console.log(state, year, geoLevelPM3CalcVer);
  if (!(state && year && geoLevelPM3CalcVer)) {
    throw new Error(
      'ERROR: state & year & geoLevelPM3CalcVer are required parameters.'
    );
  }

  return `${state}.${year}.geo-level-pm3-calculations.tmcLevelVer-${tmcLevelPM3CalcVer}.v${geoLevelPM3CalcVer}.csv`;
};

const parse = fileName => {
  const [, state] = fileName.match(stateRegExp) || [];
  const [, year] = fileName.match(yearRegExp) || [];
  const { 1: tmcLevelPM3CalcVer = '', index: tmcLevelVerIdx } =
    fileName.match(tmcLevelPM3CalcVerRegExp) || {};

  // Remove everything upto, and including, the tmcLevelPM3CalcVer
  //   in case '.v occurs somewhere in the tmcLevelPM3CalcVer,
  //   as this would break the geoLevelPM3CalcVer regex.
  const [, geoLevelPM3CalcVer] =
    fileName
      .slice(tmcLevelVerIdx + tmcLevelPM3CalcVer.length)
      .match(geoLevelPM3CalcVerRegExp) || [];

  if (!(state && year && tmcLevelPM3CalcVer && geoLevelPM3CalcVer)) {
    throw new Error('ERROR: Unrecognized fileName pattern.');
  }

  return {
    state,
    year: +year,
    tmcLevelPM3CalcVer,
    geoLevelPM3CalcVer
  };
};

module.exports = { get, parse };
