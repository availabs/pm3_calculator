#!/usr/bin/env node

const csv = require('fast-csv');

const csvInputStream = () =>
  csv({
    headers: true,
    ignoreEmpty: true,
    discardUnmappedColumns: true,
    strictColumnHandling: true,
    trim: true
  })
    .on('data', function(data) {
      this.emit(data);
    })
    .on('end', function() {
      this.emit('\n');
    });

module.exports = csvInputStream;
