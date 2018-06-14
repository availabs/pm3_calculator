const { execSync } = require('child_process');
const { join } = require('path');

const ALBANY_COUNTY_FIPS = '36001';
const computeAggregations = require('./computeAggregations');

const albanyTMCLevelPM3DataFilePath = join(
  __dirname,
  '__test_data__/tmcLevelPM3Data.AlbanyCounty-with-others.json.xz'
);

const nysSampleTMCLevelPM3DataFilePath = join(
  __dirname,
  './__test_data__/tmcLevelPM3Data.NYSSample.json.xz'
);

const albanyGeoLevelPM3DataFilePath = join(
  __dirname,
  './__test_data__/geoLevelPM3.AlbanyCounty.json.xz'
);

const albanyTMCLevelPM3Data = JSON.parse(
  execSync(`xzcat '${albanyTMCLevelPM3DataFilePath}'`, { encoding: 'utf8' })
);

describe('computeAggregations unit Tests', () => {
  test('TMC counts for single county are correct', () => {
    const {
      expectedInterstateTMCs,
      expectedNoninterstateTMCs
    } = albanyTMCLevelPM3Data
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

    const [albanyCountyPM3] = computeAggregations(
      'ny',
      albanyTMCLevelPM3Data
    ).filter(r => r.geo === ALBANY_COUNTY_FIPS);

    expect(albanyCountyPM3.interstate_tmcs).toEqual(expectedInterstateTMCs);
    expect(albanyCountyPM3.noninterstate_tmcs).toEqual(
      expectedNoninterstateTMCs
    );
  });

  test('Mileage summations for single county are correct', () => {
    const {
      expectedInterstateMileage,
      expectedNoninterstateMileage
    } = albanyTMCLevelPM3Data
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

    const [albanyCountyPM3] = computeAggregations(
      'ny',
      albanyTMCLevelPM3Data
    ).filter(r => r.geo === ALBANY_COUNTY_FIPS);

    expect(albanyCountyPM3.interstate_mileage).toEqual(
      expectedInterstateMileage
    );
    expect(albanyCountyPM3.noninterstate_mileage).toEqual(
      expectedNoninterstateMileage
    );
  });

  test('Cross-County Measures Sum to State Measure, where appropriate', () => {
    const nysSample = JSON.parse(
      execSync(`xzcat '${nysSampleTMCLevelPM3DataFilePath}'`, {
        encoding: 'utf8'
      })
    );

    const geoLevelPM3 = computeAggregations('ny', nysSample);

    const nonsummableColumns = [
      'geo',
      'type',
      'state',
      'state_code',
      'tttr_interstate*'
    ];
    const nonsummableColumnsRegExp = new RegExp(nonsummableColumns.join('|'));

    const summedCountyLevelData = geoLevelPM3.reduce((acc, d) => {
      if (d.type === 'county') {
        Object.keys(d)
          .filter(col => !col.match(nonsummableColumnsRegExp))
          .forEach(col => {
            acc[col] = (acc[col] || 0) + d[col];
          });
      }
      return acc;
    }, {});

    const stateLevelData = geoLevelPM3.find(({ type }) => type === 'state');

    Object.keys(summedCountyLevelData).forEach(col => {
      // console.log(col);
      expect(summedCountyLevelData[col]).toBeCloseTo(stateLevelData[col], 5);
    });
  });
});

describe('computeAggregations Golden Master Tests', () => {
  test('Albany County calculation equals Golden Master', () => {
    const theGoldenMaster = JSON.parse(
      execSync(`xzcat '${albanyGeoLevelPM3DataFilePath}'`, { encoding: 'utf8' })
    );

    const oldCols = Object.keys(theGoldenMaster);

    const [albanyCountyPM3] = computeAggregations(
      'ny',
      albanyTMCLevelPM3Data
    ).filter(r => r.geo === ALBANY_COUNTY_FIPS);

    const actual = oldCols.reduce((acc, col) => {
      acc[col] = albanyCountyPM3[col];
      return acc;
    }, {});

    expect(actual).toEqual(theGoldenMaster);
  });
});
