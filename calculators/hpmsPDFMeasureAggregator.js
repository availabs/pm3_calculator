const CalculatePHED = require('./phed');
const CalculateTTR = require('./ttr');

const precisionRound = (number, precision = 0) => {
  if (!Number.isFinite(+number)) {
    return '';
  }

  const factor = 10 ** precision;

  return Math.round(+number * factor) / factor;
};

function hpmsPDFMeasureAggregator({ YEAR, TIME, MEAN }) {
  return (tmcAttrs, trafficDistribution, tmcFiveteenMinIndex) => {
    const {
      lottr: {
        LOTTR_AMP,
        TT_AMP50PCT,
        TT_AMP80PCT,
        LOTTR_MIDD,
        TT_MIDD50PCT,
        TT_MIDD80PCT,
        LOTTR_PMP,
        TT_PMP50PCT,
        TT_PMP80PCT,
        LOTTR_WE,
        TT_WE80PCT
      },

      tttr: {
        TTTR_AMP,
        TTT_AMP50PCT,
        TTT_AMP95PCT,
        TTTR_MIDD,
        TTT_MIDD50PCT,
        TTT_MIDD95PCT,
        TTTR_PMP,
        TTT_PMP50PCT,
        TTT_PMP95PCT,
        TTTR_OVN,
        TTT_OVN95PCT,
        TTTR_WE,
        TTT_WE50PCT,
        TTT_WE95PCT
      }
    } = CalculateTTR(tmcAttrs, tmcFiveteenMinIndex, MEAN, 'hpms');

    const { DIR_AADT, OCC_FAC, PHED } = CalculatePHED(
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
      Segment_Length: precisionRound(tmcAttrs.length, 3),
      Directionality: tmcAttrs.direction || '',

      DIR_AADT: precisionRound(DIR_AADT),

      LOTTR_AMP: precisionRound(LOTTR_AMP, 2),
      TT_AMP50PCT: precisionRound(TT_AMP50PCT),
      TT_AMP80PCT: precisionRound(TT_AMP80PCT),
      LOTTR_MIDD: precisionRound(LOTTR_MIDD, 2),
      TT_MIDD50PCT: precisionRound(TT_MIDD50PCT),
      TT_MIDD80PCT: precisionRound(TT_MIDD80PCT),
      LOTTR_PMP: precisionRound(LOTTR_PMP, 2),
      TT_PMP50PCT: precisionRound(TT_PMP50PCT),
      TT_PMP80PCT: precisionRound(TT_PMP80PCT),
      LOTTR_WE: precisionRound(LOTTR_WE, 2),
      TT_WE80PCT: precisionRound(TT_WE80PCT),

      TTTR_AMP: precisionRound(TTTR_AMP, 2),
      TTT_AMP50PCT: precisionRound(TTT_AMP50PCT),
      TTT_AMP95PCT: precisionRound(TTT_AMP95PCT),
      TTTR_MIDD: precisionRound(TTTR_MIDD, 2),
      TTT_MIDD50PCT: precisionRound(TTT_MIDD50PCT),
      TTT_MIDD95PCT: precisionRound(TTT_MIDD95PCT),
      TTTR_PMP: precisionRound(TTTR_PMP, 2),
      TTT_PMP50PCT: precisionRound(TTT_PMP50PCT),
      TTT_PMP95PCT: precisionRound(TTT_PMP95PCT),
      TTTR_OVN: precisionRound(TTTR_OVN, 2),
      TTT_OVN95PCT: precisionRound(TTT_OVN95PCT),
      TTTR_WE: precisionRound(TTTR_WE, 2),
      TTT_WE50PCT: precisionRound(TTT_WE50PCT),
      TTT_WE95PCT: precisionRound(TTT_WE95PCT),

      PHED: precisionRound(PHED, 3),
      OCC_FAC: precisionRound(OCC_FAC, 1),

      METRIC_SOURCE: 1, // 'NPMRDS'
      COMMENTS: ''
    };
  };
}

module.exports = hpmsPDFMeasureAggregator;
