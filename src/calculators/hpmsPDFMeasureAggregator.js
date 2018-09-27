const CalculatePHED = require('./phed');
const CalculateFreeFlow = require('./freeflow');
const CalculateTTR = require('./ttr');

const precisionRound = (number, precision = 0) => {
  if (!Number.isFinite(+number)) {
    return '';
  }

  const factor = 10 ** precision;

  return Math.round(+number * factor) / factor;
};

const directionCodeMappings = {
  N: 1,
  S: 2,
  E: 3,
  W: 4
};

function hpmsPDFMeasureAggregator({ YEAR, TIME, MEAN }) {
  return (tmcAttrs, trafficDistribution, tmcFiveteenMinIndex) => {
    const {
      direction,
      f_system,
      faciltype,
      nhs,
      nhs_pct,
      length,
      state_code,
      tmc,
      ua_code
    } = tmcAttrs;

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
        TT_WE50PCT,
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
        TTT_OVN50PCT,
        TTT_OVN95PCT,
        TTTR_WE,
        TTT_WE50PCT,
        TTT_WE95PCT
      }
    } = CalculateTTR(tmcAttrs, tmcFiveteenMinIndex, MEAN, 'hpms');

    const freeflow = CalculateFreeFlow(tmcAttrs, tmcFiveteenMinIndex);
    const { freeflowTT } = freeflow;

    // tmcAttributes,
    // freeflowTT,
    // tmcFiveteenMinIndex,
    // trafficDistribution,
    // time = 12,
    // mean = DEFAULT_MEAN_TYPE,
    // colMappings = 'avail'
    const { DIR_AADT, OCC_FAC, PHED } = CalculatePHED(
      tmcAttrs,
      freeflowTT,
      tmcFiveteenMinIndex,
      trafficDistribution,
      TIME,
      MEAN,
      'hpms'
    );

    const nhsRatio = nhs_pct < 100 ? nhs_pct / 100 : 1

    return {
      Year_Record: YEAR || '',
      State_Code: +state_code || '',
      Travel_Time_Code: tmc || '',
      F_System: +f_system || '',
      Urban_Code: +ua_code || '',
      Facility_Type: +faciltype || '',
      NHS: +nhs || '',
      Segment_Length: precisionRound(length * nhsRatio, 3),
      Directionality: directionCodeMappings[direction] || 5,

      DIR_AADT: precisionRound(DIR_AADT, 2),

      LOTTR_AMP: precisionRound(LOTTR_AMP, 2),
      TT_AMP50PCT: precisionRound(TT_AMP50PCT, 2),
      TT_AMP80PCT: precisionRound(TT_AMP80PCT, 2),
      LOTTR_MIDD: precisionRound(LOTTR_MIDD, 2),
      TT_MIDD50PCT: precisionRound(TT_MIDD50PCT, 2),
      TT_MIDD80PCT: precisionRound(TT_MIDD80PCT, 2),
      LOTTR_PMP: precisionRound(LOTTR_PMP, 2),
      TT_PMP50PCT: precisionRound(TT_PMP50PCT, 2),
      TT_PMP80PCT: precisionRound(TT_PMP80PCT, 2),
      LOTTR_WE: precisionRound(LOTTR_WE, 2),
      TT_WE50PCT: precisionRound(TT_WE50PCT, 2),
      TT_WE80PCT: precisionRound(TT_WE80PCT, 2),

      TTTR_AMP: precisionRound(TTTR_AMP, 2),
      TTT_AMP50PCT: precisionRound(TTT_AMP50PCT, 2),
      TTT_AMP95PCT: precisionRound(TTT_AMP95PCT, 2),
      TTTR_MIDD: precisionRound(TTTR_MIDD, 2),
      TTT_MIDD50PCT: precisionRound(TTT_MIDD50PCT, 2),
      TTT_MIDD95PCT: precisionRound(TTT_MIDD95PCT, 2),
      TTTR_PMP: precisionRound(TTTR_PMP, 2),
      TTT_PMP50PCT: precisionRound(TTT_PMP50PCT, 2),
      TTT_PMP95PCT: precisionRound(TTT_PMP95PCT, 2),
      TTTR_OVN: precisionRound(TTTR_OVN, 2),
      TTT_OVN50PCT: precisionRound(TTT_OVN50PCT, 2),
      TTT_OVN95PCT: precisionRound(TTT_OVN95PCT, 2),
      TTTR_WE: precisionRound(TTTR_WE, 2),
      TTT_WE50PCT: precisionRound(TTT_WE50PCT, 2),
      TTT_WE95PCT: precisionRound(TTT_WE95PCT, 2),

      PHED: precisionRound(PHED * nhsRatio, 3),
      OCC_FAC: precisionRound(OCC_FAC, 2),

      METRIC_SOURCE: 1, // 'NPMRDS'
      COMMENTS: ''
    };
  };
}

module.exports = hpmsPDFMeasureAggregator;
