let Promise = require('bluebird');
let ProgressBar = require('progress');
let fs = require('fs');
let d3 = require('d3-dsv');

let { 
	DownloadTMCData, 
	DownloadTMCAtttributes,
	getTrafficDistribution
} = require('./utils/data_retrieval')

let CalculatePHED = require('./calculators/phed')
let CalculateTTR = require('./calculators/ttr')

let bar = null;
const YEAR = 2017
const STATE = 'nj'
const MEAN = 'mean'
const TIME = 3 //number of epochs to group
			   // 12 = 1 hour
			   // 3 = 15 minute


const CalculateMeasures = function CalculateMeasures (tmc, year) {
	var trafficDistribution = getTrafficDistribution(
		tmc.directionality,
		tmc.congestion_level,
		tmc.is_controlled_access,
		TIME
	)
	var dirFactor = +tmc.faciltype > 1 ? 2 : 1 
  	tmc.directional_aadt = tmc.aadt / dirFactor
	return DownloadTMCData(tmc.tmc, year, STATE)
		.then((tmcData) => {
			return new Promise(function (resolve, reject) {
				var tmcFiveteenMinIndex = tmcData.rows.reduce((output, current) => {
					var reduceIndex = current.npmrds_date + '_' + Math.floor(current.epoch/3)
					if (!output[reduceIndex]) { output[reduceIndex] = { speed:[], tt:[] } }
					output[reduceIndex].speed.push(+tmc.length / (current.travelTime / 3600))
					output[reduceIndex].tt.push(Math.round(current.travelTime)) 
					return output
				}, {})

				var phed = CalculatePHED(tmc, tmcFiveteenMinIndex, trafficDistribution, TIME,MEAN)
				var ttr = CalculateTTR(tmc, tmcFiveteenMinIndex)
				bar.tick()
				resolve({
					...tmc,
					...ttr.lottr,
					...ttr.tttr,
					...phed.vehicle_delay,
					...phed.delay
				})		
			});
		})

	//return trafficDistribution
}

DownloadTMCAtttributes(STATE)
	.then(tmcs => {
		var testTmcs = tmcs.rows
			//.filter((d,i) => d.tmc === '120P04340')
			//.filter((d,i) => i < 200)
		TOTAL = testTmcs.length
		bar = new ProgressBar('[:bar] :current/:total = :percent  :elapsed/:eta', { total: TOTAL });
		return Promise.map(testTmcs, (tmc) => {
			return CalculateMeasures(tmc, YEAR)
		},{concurrency: 10})
		.then(measures => {
			var output = d3.csvFormat(measures)
			console.log(measures)
			fs.writeFile(`data/${STATE}_${YEAR}_${MEAN}_${TIME}.csv`, output, function(err) {
			    if(err) { return console.log(err) }
			    console.log("The file was saved!")
				return
			}); 			
			return
		})

	});