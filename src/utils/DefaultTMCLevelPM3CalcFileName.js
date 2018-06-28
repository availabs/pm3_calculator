const tmcRegExp = require('./tmcRegExp');

const stateRegExp = /^([A-Z]{2})\./i;
const yearRegExp = /^[A-Z]{2}\.(\d{4})\./i;
const meanRegExp = /tmc-level-pm3-calculations\.(h?mean)_/;
const timeRegExp = /tmc-level-pm3-calculations\.h?mean_(\d{1,})\./;
const tmcsCommaSeparatedListRegExp = /tmcs([^.]{9,})\./i;
const headQualifierRegExp = /head(\d{1,})\./;
const tmcLevelPM3CalcVerRegExp = /\.v(.{1,}).csv$/;

const legitMeansRegExp = /^h?mean/i;

const get = ({ head, mean, state, time, tmcLevelPM3CalcVer, tmcs, year }) => {
  if (!(mean && time && tmcLevelPM3CalcVer && state && year)) {
    throw new Error(
      'ERROR: mean && time && tmcLevelPM3CalcVer && state && year are required parameters.'
    );
  }

  if (!mean.match(legitMeansRegExp)) {
    throw new Error(`ERROR: Unrecognized mean type ${mean}`);
  }

  if (!Number.isFinite(+time)) {
    throw new Error(`ERROR: Unrecognized time ${time}`);
  }

  const tmcsArr = tmcs && (Array.isArray(tmcs) ? tmcs : tmcs.split(','));

  if (tmcsArr) {
    for (let i = 0; i < tmcsArr.length; i += 1) {
      const tmc = tmcsArr[i];
      if (!tmc.match(tmcRegExp)) {
        throw new Error(`Error: Invalid TMC ${tmc}`);
      }
    }
  }

  const tmcsQualifier = tmcsArr ? `.tmcs${tmcsArr.join('_')}` : '';

  if (head && !Number.isFinite(+head)) {
    throw new Error(`ERROR: Invalid head ${head}`);
  }
  const headQualifier = head ? `.head${head}` : '';

  const fileName = `${state}.${year}.tmc-level-pm3-calculations.${mean}_${time}${tmcsQualifier}${headQualifier}.v${tmcLevelPM3CalcVer}.csv`;

  return fileName;
};

const parse = fileName => {
  const [, state] = fileName.match(stateRegExp) || [];
  const [, year] = fileName.match(yearRegExp) || [];
  const [, mean] = fileName.match(meanRegExp) || [];
  const [, time] = fileName.match(timeRegExp) || [];
  const [, tmcsQualifier] = fileName.match(tmcsCommaSeparatedListRegExp) || [];
  const [, headQualifier] = fileName.match(headQualifierRegExp) || [];
  const [, tmcLevelPM3CalcVer] = fileName.match(tmcLevelPM3CalcVerRegExp) || [];

  const tmcs = tmcsQualifier && tmcsQualifier.split('_');
  const head = headQualifier && +headQualifier;

  if (!(state && year && mean && time && tmcLevelPM3CalcVer)) {
    throw new Error('ERROR: Unrecognized fileName pattern.');
  }

  return {
    state,
    year: +year,
    mean,
    time: +time,
    head,
    tmcs,
    tmcLevelPM3CalcVer
  };
};

module.exports = { get, parse };
