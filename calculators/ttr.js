let d3 = require('d3-array')
const precisionRound = require('./utils/precisionRound')
const WEEKDAYS = [1,2,3,4,5]
const WEEKENDS = [0,6]

const CalculateTTR = function CalculateLottr(tmc, tmcFiveteenMinIndex,mean='mean'){
	
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
    	var len = tmcFiveteenMinIndex[key].tt.length
    	var hmean = +precisionRound(len / hsum_tt, 0)
    	var mean = +precisionRound(sum_tt / len, 0)
    	//mean = sum_tt / len
    
      return {
        dateTime,
        epoch,
        hmean,
        mean
      }
    })

	function numSort(a,b) {
		return +a - +b
	}
    
	var amPeak = fifteenData
		.filter(d => {
			return( 
				WEEKDAYS.includes(d.dateTime.getDay())
				&& (d.epoch >= 24 && d.epoch < 40)
			)
		})
		.map(d => d[mean])
		.sort(numSort)

	var offPeak = fifteenData
		.filter(d => {
			return( 
				WEEKDAYS.includes(d.dateTime.getDay())
				&& (d.epoch >= 40 && d.epoch < 64)
			)
		})
		.map(d => d[mean])
		.sort(numSort)

	var pmPeak = fifteenData
		.filter(d => {
			return( 
				WEEKDAYS.includes(d.dateTime.getDay())
				&& (d.epoch >= 64 && d.epoch < 80)
			)
		})
		.map(d => d[mean])
		.sort(numSort)

	var weekendPeak = fifteenData
		.filter(d => {
			return( 
				WEEKENDS.includes(d.dateTime.getDay())
				&& (d.epoch >= 24 && d.epoch < 80)
			)
		})
		.map(d => d[mean])
		.sort(numSort)

	var overnightPeak = fifteenData
		.filter(d => {
			return( 
				WEEKDAYS.includes(d.dateTime.getDay())
				&& (d.epoch < 24 || d.epoch > 80)
			)
		})
		.map(d => d[mean])
		.sort(numSort)
		
		//console.log('overnightPeak')
		//console.log(overnightPeak)
		//console.log(d3.quantile(overnightPeak, 0.95 ), d3.quantile(overnightPeak, 0.5),d3.quantile(overnightPeak, 0.8 ) / d3.quantile(overnightPeak, 0.5))
		// var someData = fifteenData
		// 	.map(d => d[mean])
		// 	.sort()

		// someData = offPeak
		// console.log(JSON.stringify(someData))
		// console.log('-------------------------')
		// console.log('extent', d3.extent(someData))
		// console.log('mean', d3.mean(someData))
		// console.log('median', d3.median(someData))
		// console.log('variance', d3.variance(someData))
		// console.log('deviation', d3.deviation(someData))
		// console.log('-------------------------')

		// console.log('am', d3.quantile(amPeak, 0.5), d3.quantile(amPeak, 0.8 ), d3.quantile(amPeak, 0.8 ) / d3.quantile(amPeak, 0.5))
		// console.log('off', d3.quantile(offPeak, 0.5), d3.quantile(offPeak, 0.8 ), d3.quantile(offPeak, 0.8 ) / d3.quantile(offPeak, 0.5))
		// console.log('pm', d3.quantile(pmPeak, 0.5), d3.quantile(pmPeak, 0.8 ), d3.quantile(pmPeak, 0.8 ) / d3.quantile(pmPeak, 0.5))
		// console.log('weekend', d3.quantile(weekendPeak, 0.5), d3.quantile(weekendPeak, 0.8 ) ,d3.quantile(weekendPeak, 0.8 ) / d3.quantile(weekendPeak, 0.5))

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


