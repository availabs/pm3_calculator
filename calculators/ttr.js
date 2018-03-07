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
    	var hmean_tt = precisionRound(len / hsum_tt, 2)
    	var mean_tt = precisionRound(sum_tt / len, 2)
    
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

	var offPeak = fifteenData
		.filter(d => {
			return( 
				WEEKDAYS.includes(d.dateTime.getDay())
				&& (d.epoch >= 40 && d.epoch < 64)
			)
		})
		.map(d => d[mean])

	var pmPeak = fifteenData
		.filter(d => {
			return( 
				WEEKDAYS.includes(d.dateTime.getDay())
				&& (d.epoch >= 64 && d.epoch < 80)
			)
		})
		.map(d => d[mean])

	var weekendPeak = fifteenData
		.filter(d => {
			return( 
				WEEKENDS.includes(d.dateTime.getDay())
				&& (d.epoch >= 24 && d.epoch < 80)
			)
		})
		.map(d => d[mean])

	var overnightPeak = fifteenData
		.filter(d => {
			return( 
				WEEKDAYS.includes(d.dateTime.getDay())
				&& (d.epoch < 24 && d.epoch > 80)
			)
		})
		.map(d => d[mean])

	return {
		lottr: {
			lottr_am: d3.quantile(amPeak, 80 ) / d3.quantile(amPeak, 50),
			lottr_off: d3.quantile(offPeak, 80 ) / d3.quantile(offPeak, 50),
			lottr_pm: d3.quantile(pmPeak, 80 ) / d3.quantile(pmPeak, 50),
			lottr_weekend: d3.quantile(weekendPeak, 80 ) / d3.quantile(weekendPeak, 50)
		},
		tttr: {
			tttr_am: d3.quantile(amPeak, 95 ) / d3.quantile(amPeak, 50),
			tttr_off: d3.quantile(offPeak, 95 ) / d3.quantile(offPeak, 50),
			tttr_pm: d3.quantile(pmPeak, 95 ) / d3.quantile(pmPeak, 50),
			tttr_overnight: d3.quantile(overnightPeak, 95 ) / d3.quantile(overnightPeak, 50),
			tttr_weekend: d3.quantile(weekendPeak, 95 ) / d3.quantile(weekendPeak, 50)

		}
	}
}
module.exports = CalculateTTR

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}