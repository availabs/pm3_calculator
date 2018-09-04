#!/usr/bin/env node

const TRAFFIC_DISTRIBUTIONS = require('./traffic_distribution_cattlab.json');

const comparator = (a, b) =>
  a.directionality.localeCompare(b.directionality) ||
  a.road_type.localeCompare(b.road_type) ||
  b.max_pct_hrly - a.max_pct_hrly;

const distMaxes = Object.entries(TRAFFIC_DISTRIBUTIONS)
  .map(([name, pcts]) => ({
    directionality: `${name.match(/AM_PEAK|PM_PEAK|EVEN_DIST/) || 'Weekend'}`,
    congestion_level: name.substring(8).replace(/_CONGESTION.*/, ''),
    road_type: name.replace(/^.*_/, ''),
    day_type: `${name.match(/WEEKDAY|WEEKEND/) || ''}`,
    max_pct_hrly: Math.max(...pcts)
  }))
  .sort(comparator);

console.log('directionality,congestion_level,road_type,day_type,max_pct_hrly');
distMaxes.forEach(
  ({ directionality, congestion_level, road_type, day_type, max_pct_hrly }) =>
    console.log(
      `${directionality},${congestion_level},${road_type},${day_type},${max_pct_hrly}`
    )
);
