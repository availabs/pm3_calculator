const stateRegExp = /^"?([A-Z]{2})"?\./i;
const yearRegExp = /_(\d{4})/;
const tmcLevelPM3CalcVerRegExp = /_v(.{1,})/;

const get = ({ state, year, npmrdsVer, tmcLevelPM3CalcVer }) => {
  if (!state && year) {
    throw new Error(
      'ERROR: year-level tables inherit from the state-level tables.' +
        '  Therefore, there are no year-level tables in the "public" schema.'
    );
  }

  // TODO: create views that remove this constraint
  if (!year && tmcLevelPM3CalcVer) {
    throw new Error(
      'ERROR: tmcs-level PM3 calculation version tables inherit from the year-level tables.' +
        '  Therefore, there are no cross-year calculation-version-level tables.'
    );
  }

  const stateQualifier = state ? `"${state}".` : '';
  const yearQualifier = year ? `_${year}` : '';
  const npmrdsVerQualifier = +npmrdsVer === 1 ? '_npmrdsv1' : '';
  const tmcLevelPM3CalcVerQualifier = tmcLevelPM3CalcVer
    ? `_v${tmcLevelPM3CalcVer}`
    : '';

  const tableName = `${stateQualifier}pm3${npmrdsVerQualifier}${yearQualifier}${tmcLevelPM3CalcVerQualifier}`;

  return tableName;
};

const parse = tableName => {
  const [, state] = tableName.match(stateRegExp) || [];
  const [, year] = tableName.match(yearRegExp) || [];
  const [, tmcLevelPM3CalcVer] =
    tableName.match(tmcLevelPM3CalcVerRegExp) || [];

  console.log(tableName, year);

  return {
    state,
    year: +year || undefined,
    tmcLevelPM3CalcVer
  };
};

module.exports = { get, parse };
