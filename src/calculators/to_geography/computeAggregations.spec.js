const { execSync } = require('child_process');
const { join } = require('path');

const ALBANY_COUNTY_FIPS = '36001';
const computeAggregations = require('./computeAggregations');

const tmcLevelPM3DataFilePath = join(
  __dirname,
  '__test_data__/tmcLevelPM3Data.AlbanyCounty-with-others.json.xz'
);

const geoLevelPM3DataFilePath = join(
  __dirname,
  './__test_data__/geoLevelPM3.AlbanyCounty.json.xz'
);

const tmcLevelPM3Data = JSON.parse(
  execSync(`xzcat '${tmcLevelPM3DataFilePath}'`, { encoding: 'utf8' })
);

describe('computeAggregations unit Tests', () => {
  test('TMC counts are correct', () => {
    const {
      expectedInterstateTMCs,
      expectedNoninterstateTMCs
    } = tmcLevelPM3Data
      .filter(({ nhs, county }) => nhs === 1 && county === ALBANY_COUNTY_FIPS)
      .reduce(
        (acc, { is_interstate }) => {
          if (is_interstate) {
            acc.expectedInterstateTMCs += 1;
          } else {
            acc.expectedNoninterstateTMCs += 1;
          }
          return acc;
        },
        { expectedInterstateTMCs: 0, expectedNoninterstateTMCs: 0 }
      );

    const [albanyCountyPM3] = computeAggregations('ny', tmcLevelPM3Data).filter(
      r => r.geo === ALBANY_COUNTY_FIPS
    );

    expect(albanyCountyPM3.interstate_tmcs).toEqual(expectedInterstateTMCs);
    expect(albanyCountyPM3.noninterstate_tmcs).toEqual(
      expectedNoninterstateTMCs
    );
  });

  test('Mileage summations are correct', () => {
    const {
      expectedInterstateMileage,
      expectedNoninterstateMileage
    } = tmcLevelPM3Data
      .filter(({ nhs, county }) => nhs === 1 && county === ALBANY_COUNTY_FIPS)
      .reduce(
        (acc, { is_interstate, length }) => {
          if (is_interstate && length) {
            acc.expectedInterstateMileage += +length;
          } else {
            acc.expectedNoninterstateMileage += +length;
          }
          return acc;
        },
        { expectedInterstateMileage: 0, expectedNoninterstateMileage: 0 }
      );

    const [albanyCountyPM3] = computeAggregations('ny', tmcLevelPM3Data).filter(
      r => r.geo === ALBANY_COUNTY_FIPS
    );

    expect(albanyCountyPM3.interstate_mileage).toEqual(
      expectedInterstateMileage
    );
    expect(albanyCountyPM3.noninterstate_mileage).toEqual(
      expectedNoninterstateMileage
    );
  });
});

describe('computeAggregations Golden Master Tests', () => {
  test('Albany County calculation equals Golden Master', () => {
    const theGoldenMaster = JSON.parse(
      execSync(`xzcat '${geoLevelPM3DataFilePath}'`, { encoding: 'utf8' })
    );

    const oldCols = Object.keys(theGoldenMaster);

    const [albanyCountyPM3] = computeAggregations('ny', tmcLevelPM3Data).filter(
      r => r.geo === ALBANY_COUNTY_FIPS
    );

    const actual = oldCols.reduce((acc, col) => {
      acc[col] = albanyCountyPM3[col];
      return acc;
    }, {});

    expect(actual).toEqual(theGoldenMaster);
  });
});
