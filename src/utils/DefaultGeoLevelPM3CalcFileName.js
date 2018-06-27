const stateRegExp = /^([A-Z]{2})\./i;
const yearRegExp = /^[A-Z]{2}\.(\d{4})\./i;
const npmrdsVer1RegExp = /npmrdsv1/;
const tmcLevelPM3CalcVerRegExp = /tmcLevelVer-(.{1,})\.v/;
const geoLevelPM3CalcVerRegExp = /\.v(.{1,})\.csv$/;

const get = ({
  state,
  year,
  npmrdsVer,
  tmcLevelPM3CalcVer = 'unknown',
  geoLevelPM3CalcVer
}) => {
  if (!(state && year && geoLevelPM3CalcVer)) {
    throw new Error(
      'ERROR: state & year & geoLevelPM3CalcVer are required parameters.'
    );
  }

  const npmrdsVerQualifier = +npmrdsVer === 1 ? '.npmrdsv1' : '';

  return `${state}.${year}.geo-level-pm3-calculations${npmrdsVerQualifier}.tmcLevelVer-${tmcLevelPM3CalcVer}.v${geoLevelPM3CalcVer}.csv`;
};

const parse = fileName => {
  const [, state] = fileName.match(stateRegExp) || [];
  const [, year] = fileName.match(yearRegExp) || [];
  const npmrdsVer = fileName.match(npmrdsVer1RegExp) ? 1 : 2;
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
    npmrdsVer,
    tmcLevelPM3CalcVer,
    geoLevelPM3CalcVer
  };
};

module.exports = { get, parse };
