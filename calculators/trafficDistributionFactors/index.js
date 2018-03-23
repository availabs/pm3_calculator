const computeTrafficDistFactors = require('./computeTrafficDistFactors');

const getTrafficDistributionFactors = ({
  attrs: { is_controlled_access, length },
  data
}) => {
  const {
    combinedPeakAvgTT,
    amPeakAvgTT,
    pmPeakAvgTT,
    freeFlowAvgTT
  } = computeTrafficDistFactors(data);

  const speedReductionFactor = freeFlowAvgTT / combinedPeakAvgTT;

  let congestion_level;

  if (is_controlled_access) {
    // Freeway
    if (!speedReductionFactor || speedReductionFactor >= 0.9) {
      congestion_level = 'NO2LOW_CONGESTION';
    } else if (speedReductionFactor >= 0.75) {
      congestion_level = 'MODERATE_CONGESTION';
    } else {
      congestion_level = 'SEVERE_CONGESTION';
    }
  } else {
    if (!speedReductionFactor || speedReductionFactor >= 0.8) {
      congestion_level = 'NO2LOW_CONGESTION';
    } else if (speedReductionFactor >= 0.65) {
      congestion_level = 'MODERATE_CONGESTION';
    } else {
      congestion_level = 'SEVERE_CONGESTION';
    }
  }

  const peakTimeDifferential =
    Math.max(amPeakAvgTT, pmPeakAvgTT) - Math.min(amPeakAvgTT, pmPeakAvgTT);

  const peakSpeedDifferential = length / peakTimeDifferential * 3600;

  let directionality;

  if (!peakSpeedDifferential || peakSpeedDifferential <= 6) {
    directionality = 'EVEN_DIST';
  } else {
    directionality = amPeakAvgTT > pmPeakAvgTT ? 'AM_PEAK' : 'PM_PEAK';
  }

  return {
    congestion_level,
    directionality
  };
};

module.exports = getTrafficDistributionFactors;
