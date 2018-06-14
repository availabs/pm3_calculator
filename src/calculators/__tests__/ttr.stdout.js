const { execSync, spawn } = require('child_process');
const { join } = require('path');

const { pipeline, each } = require('mississippi');
const split = require('binary-split');

const CalculateTTR = require('../ttr');

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
  './calculators_output/3fec2e9e8b9c54dd7a11f197d85ad4f6ce202654/ttr.AlbanyCounty.ndjson.xz'
);

const goldenMaster = JSON.parse(
  execSync(
    `xzcat ${goldenMasterFilePath} | jq -s '. | map({ (.tmc): .ttr }) | add'`
  )
);

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
    if (tmc !== '120-05835') return next();

    if (!goldenMaster[tmc]) {
      return next();
    }

    const tmcAttrs = tmcAttributes[tmc];

    const ttr = CalculateTTR(tmcAttrs, tmcFiveteenMinIndex, 'mean', 'avail');

    console.log(JSON.stringify(ttr));

    return next();
  }
);
