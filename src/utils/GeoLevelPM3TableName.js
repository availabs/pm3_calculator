const stateRegExp = /^"?([A-Z]{2})"?\./i;
const yearRegExp = /_(\d{4})/;
const geoLevelPM3CalcVerRegExp = /_v(.{1,})/;

const get = ({ state, year, npmrdsVer, geoLevelPM3CalcVer }) => {
  if (!state && year) {
    throw new Error(
      'ERROR: year-level tables inherit from the state-level tables.' +
        '  Therefore, there are no year-level tables in the "public" schema.'
    );
  }

  // TODO: create views that remove this constraint
  if (!year && geoLevelPM3CalcVer) {
    throw new Error(
      'ERROR: tmcs-level PM3 calculation version tables inherit from the year-level tables.' +
        '  Therefore, there are no cross-year calculation-version-level tables.'
    );
  }

  const stateQualifier = state ? `"${state}".` : '';
  const yearQualifier = year ? `_${year}` : '';
  const npmrdsVerQualifier = +npmrdsVer === 1 ? '_npmrdsv1' : '';
  const geoLevelPM3CalcVerQualifier = geoLevelPM3CalcVer
    ? `_v${geoLevelPM3CalcVer}`
    : '';

  const tableName = `${stateQualifier}geolevel_pm3${npmrdsVerQualifier}${yearQualifier}${geoLevelPM3CalcVerQualifier}`;

  return tableName;
};

const parse = tableName => {
  const [, state] = tableName.match(stateRegExp) || [];
  const [, year] = tableName.match(yearRegExp) || [];
  const [, geoLevelPM3CalcVer] =
    tableName.match(geoLevelPM3CalcVerRegExp) || [];

  return {
    state,
    year: +year || undefined,
    geoLevelPM3CalcVer
  };
};

module.exports = { get, parse };
