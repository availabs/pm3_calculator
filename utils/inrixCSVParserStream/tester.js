#!/usr/bin/env node

const { stringify } = require('event-stream');

const inrixParserStream = require('./index.js');

process.stdin
  .pipe(inrixParserStream())
  .pipe(stringify())
  .pipe(process.stdout);
