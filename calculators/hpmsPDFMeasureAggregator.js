const CalculatePHED = require('./phed');
const CalculateTTR = require('./ttr');

function hpmsPDFMeasureAggregator({ YEAR, TIME, MEAN }) {
  return (tmcAttrs, trafficDistribution, tmcFiveteenMinIndex) => {
    const ttr = CalculateTTR(tmcAttrs, tmcFiveteenMinIndex, MEAN, 'hpms');

    const phed = CalculatePHED(
      tmcAttrs,
      tmcFiveteenMinIndex,
      trafficDistribution,
      TIME,
      MEAN,
      'hpms'
    );

    return {
      Year_Record: YEAR || '',
      State_Code: +tmcAttrs.state_code || '',
      Travel_Time_Code: tmcAttrs.tmc || '',
      F_System: +tmcAttrs.f_system || '',
      Urban_Code: +tmcAttrs.ua_code || '',
      Facility_Type: +tmcAttrs.faciltype || '',
      NHS: +tmcAttrs.nhs || '',
      Segment_Length: +tmcAttrs.length || '',
      Directionality: tmcAttrs.direction || '',
      ...ttr.lottr,
      ...ttr.tttr,
      ...phed,
      METRIC_SOURCE: 'NPMRDS',
      COMMENTS: ''
    };
  };
}

module.exports = hpmsPDFMeasureAggregator;
