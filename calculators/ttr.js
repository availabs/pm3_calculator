let d3 = require('d3-array')
const WEEKDAYS = [1,2,3,4,5]
const WEEKENDS = [0,6]

const CalculateTTR = function CalculateLottr(tmc, tmcFiveteenMinIndex,year,mean='hmean_tt'){
	
	var fifteenData = Object.keys(tmcFiveteenMinIndex).map( (key,i) => {
    	var epoch = key.split('_')[1]
    	var hour = Math.floor(epoch / 4).toString()
    	hour = hour.length === 1 ? ('0' + hour) : hour
    	var min = ((epoch % 4) * 15).toString()
    	min = min.length === 1 ? ('0' + min) : min
    	var dateString = key.split('_')[0]
    	var yearMonthDay = dateString.substring(0, 4) +
      	'-' + dateString.substring(4, 6) +
      	'-' + dateString.substring(6, 8)
    	var dateTime = new Date(yearMonthDay + 'T' + hour + ':' + min + ':00')
    	var sum_tt = tmcFiveteenMinIndex[key].tt.reduce((a, b) => a += b)
    	var hsum_tt = tmcFiveteenMinIndex[key].tt.reduce((a, b) => { return a += (1 / b) }, 0)
    	var len = tmcFiveteenMinIndex[key].speed.length
    	var hmean_tt = precisionRound(len / hsum_tt, 0)
    	var mean_tt = precisionRound(sum_tt / len, 0)
    
      return {
        dateTime,
        epoch,
        hmean_tt,
        mean_tt,
      }
    })
    
	var amPeak = fifteenData
		.filter(d => {
			return( 
				WEEKDAYS.includes(d.dateTime.getDay())
				&& (d.epoch >= 24 && d.epoch < 40)
			)
		})
		.map(d => d[mean])
		.sort()

	var offPeak = fifteenData
		.filter(d => {
			return( 
				WEEKDAYS.includes(d.dateTime.getDay())
				&& (d.epoch >= 40 && d.epoch < 64)
			)
		})
		.map(d => d[mean])
		.sort()

	var pmPeak = fifteenData
		.filter(d => {
			return( 
				WEEKDAYS.includes(d.dateTime.getDay())
				&& (d.epoch >= 64 && d.epoch < 80)
			)
		})
		.map(d => d[mean])
		.sort()

	var weekendPeak = fifteenData
		.filter(d => {
			return( 
				WEEKENDS.includes(d.dateTime.getDay())
				&& (d.epoch >= 24 && d.epoch < 80)
			)
		})
		.map(d => d[mean])
		.sort()

	var overnightPeak = fifteenData
		.filter(d => {
			return( 
				WEEKDAYS.includes(d.dateTime.getDay())
				&& (d.epoch < 24 || d.epoch > 80)
			)
		})
		.map(d => d[mean])
		.sort()
		
		//console.log('overnightPeak')
		//console.log(overnightPeak)
		//console.log(d3.quantile(overnightPeak, 0.95 ), d3.quantile(overnightPeak, 0.5),d3.quantile(overnightPeak, 0.8 ) / d3.quantile(overnightPeak, 0.5))
	
	return {
		lottr: {
			lottr_am: precisionRound(d3.quantile(amPeak, 0.8 ) / d3.quantile(amPeak, 0.5), 2),
			lottr_off: precisionRound(d3.quantile(offPeak, 0.8 ) / d3.quantile(offPeak, 0.5), 2),
			lottr_pm: precisionRound(d3.quantile(pmPeak, 0.8 ) / d3.quantile(pmPeak, 0.5), 2),
			lottr_weekend: precisionRound(d3.quantile(weekendPeak, 0.8 ) / d3.quantile(weekendPeak, 0.5), 2),
		},
		tttr: {
			tttr_am: precisionRound(d3.quantile(amPeak, 0.95 ) / d3.quantile(amPeak, 0.5), 2),
			tttr_off: precisionRound(d3.quantile(offPeak, 0.95 ) / d3.quantile(offPeak, 0.5), 2),
			tttr_pm: precisionRound(d3.quantile(pmPeak, 0.95 ) / d3.quantile(pmPeak, 0.5), 2),
			tttr_overnight: precisionRound(d3.quantile(overnightPeak, 0.95 ) / d3.quantile(overnightPeak, 0.5), 2),
			tttr_weekend: precisionRound(d3.quantile(weekendPeak, 0.95 ) / d3.quantile(weekendPeak, 0.5), 2)
		}
	}
}
module.exports = CalculateTTR

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}