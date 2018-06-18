#!/usr/bin/env node

/* eslint no-console: 0 */

// https://www.developerfiles.com/adding-and-retrieving-comments-on-postgresql-tables/

const { execSync } = require('child_process');
const { join } = require('path');

const envFile = require('node-env-file');

envFile(join(__dirname, '../config/postgres.env'));
console.log('FOOOO');

const {
  HOSTNAME,
  GIT_HASH,
  TABLE_VERSION,
  CSV_PATH,
  HEAD,
  MEAN,
  NPMRDS_DATA_SOURCE,
  STATE,
  TIME,
  TMCS,
  YEAR
} = process.env;

if (!(TABLE_VERSION && STATE && YEAR)) {
  console.error(
    'ERROR: TABLE_VERSION, STATE, AND YEAR are required ENV variables.'
  );
  process.exit(1);
}

const getTableName = () => `"${STATE}".pm3_${YEAR}_v${TABLE_VERSION}`;

const buildTableComment = () =>
  JSON.stringify(
    {
      HOSTNAME,
      GIT_HASH,
      TABLE_VERSION,
      CSV_PATH,
      HEAD,
      MEAN,
      NPMRDS_DATA_SOURCE,
      STATE,
      TIME,
      TMCS,
      YEAR
    },
    null,
    4
  );

const loadTable = ({ tableName, tableComment }) => {
  const cmd = `
    read -r HEADER;
    psql \
      -c 'CREATE TABLE ${tableName} (LIKE "${STATE}".pm3 INCLUDING ALL);' \
      -c "COPY ${tableName} ($HEADER) FROM STDIN CSV;" \
      -c "COMMENT ON TABLE ${tableName} IS '${tableComment}';"
    `;

  console.log(cmd);

  return execSync(cmd, { encoding: 'utf8', stdio: [process.stdin] });
};

const doIt = async () => {
  try {
    const tableName = getTableName();
    const tableComment = buildTableComment();

    const output = loadTable({ tableName, tableComment });
    console.log(output);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

doIt();
