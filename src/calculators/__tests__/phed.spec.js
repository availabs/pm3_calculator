const { execSync, spawn } = require('child_process');
const { join } = require('path');

const { pipeline, each } = require('mississippi');
const split = require('binary-split');

const getTrafficDistribution = require('./utils/getTrafficDistribution');
const CalculatePHED = require('../phed');

const gitHashes = require('./utils/getGitHistoryHashes');

const goldenMasterVersions = new Set(
  execSync(
    `find ${join(__dirname, './calculators_output/')} -type d -printf '%f '`,
    {
      encoding: 'utf8'
    }
  ).split(' ')
);
const latestGoldenMasterVersion = gitHashes.find(gh =>
  goldenMasterVersions.has(gh)
);

const MEAN = 'mean';
const TIME = 12; // number of epochs to group

// Load the tmcAttributes
const tmcAttrsFilePath = join(
  __dirname,
  './controlInputs/tmcAttributes.AlbanyCounty.json.xz'
);
const tmcAttributes = JSON.parse(
  execSync(`xzcat '${tmcAttrsFilePath}'`, { encoding: 'utf8' })
);

const fiveteenMinIndexerFilePath = join(
  __dirname,
  './controlInputs/fiveteenMinIndexer.AlbanyCounty.ndjson.xz'
);

const goldenMasterFilePath = join(
  __dirname,
  `./calculators_output/${latestGoldenMasterVersion}/`,
  'phed.AlbanyCounty.ndjson.xz'
);

const goldenMaster = JSON.parse(
  execSync(
    `xzcat ${goldenMasterFilePath} | jq -s '. | map({ (.tmc): .phed }) | add'`
  )
);

describe('CalculatePHED Golden Master Tests', () => {
  test(
    'Albany County 2017',
    done => {
      each(
        pipeline(
          // stream the uncompressed fiveteenMinIndexerFile
          spawn('xzcat', [fiveteenMinIndexerFilePath], {
            encoding: 'utf8'
          }).stdout,
          // split on new lines
          split()
        ),

        (line, next) => {
          const { tmc, tmcFiveteenMinIndex } = JSON.parse(line.toString());

          if (!goldenMaster[tmc]) {
            return next();
          }

          const tmcAttrs = tmcAttributes[tmc];

          const trafficDistribution = getTrafficDistribution(
            tmc.directionality,
            tmc.congestion_level,
            tmc.is_controlled_access
          );

          const phed = CalculatePHED(
            tmcAttrs,
            tmcFiveteenMinIndex,
            trafficDistribution,
            TIME,
            MEAN
          );

          expect(phed).toEqual(goldenMaster[tmc]);

          next();
        },
        err => {
          if (err) {
            done.fail(err);
          } else {
            done();
          }
        }
      );
    },
    10000000
  );
});
