#!/usr/bin/env node

let { 
	DownloadTMCDataHERE, 
	DownloadTMCAtttributes,
	getTrafficDistribution,
	DownloadHereToInrixMap
} = require('./utils/data_retrieval')


const { env } = process;

let Promise = require('bluebird');
let ProgressBar = require('progress');
let fs = require('fs');
let d3 = require('d3-dsv');

const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));


let CalculatePHED = require('./calculators/phed')
let CalculateTTR = require('./calculators/ttr')

let bar = null;

const toNumerics = (o) => Object.keys(o).reduce(
  (acc, k) => {
    acc[k] = (Number.isFinite(+o[k])) ? parseFloat(o[k]) : o[k]
    return acc
  },
  {}
)


const {
  SPEED_FILTER = 3,
  DIR = 'data/',
  YEAR = process.env.YEAR || 2016,
  STATE = process.env.STATE || 'ny',
  MEAN = 'mean',
  TIME = 12 //number of epochs to group
} = toNumerics(Object.assign({}, env, argv));

const CalculateMeasures = function CalculateMeasures (tmc, year) {
	var trafficDistribution = getTrafficDistribution(
		tmc.directionality,
		tmc.congestion_level,
		tmc.is_controlled_access,
		TIME,
		'cattlab'
	)
	var dirFactor = +tmc.faciltype > 1 ? 2 : 1 
  	tmc.directional_aadt = tmc.aadt / dirFactor
	return DownloadTMCDataHERE(tmc.tmc, year, STATE)
		.then((tmcData) => {
			return new Promise(function (resolve, reject) {
				// console.log('testing', tmcData.rows)
				var tmcFiveteenMinIndex = tmcData.rows.reduce((output, current) => {
					var reduceIndex = current.npmrds_date + '_' + Math.floor(current.epoch/3)
					var speed = +tmc.length / (current.travelTime / 3600)
					if(SPEED_FILTER && speed > SPEED_FILTER)  {
						if (!output[reduceIndex]) { output[reduceIndex] = { speed:[], tt:[] } }
						output[reduceIndex].speed.push(speed)
						output[reduceIndex].tt.push(current.travelTime) 
					}
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
	.then(inrix_tmcs => {
		var testTmcs = inrix_tmcs.rows
		var tmcLookup = testTmcs
			.reduce((output,curr) =>{
				output[curr.tmc] = curr
				return output
			},{})
		//console.log('we get inrix tmcs', tmcLookup)
		DownloadHereToInrixMap()
			.then(here_tmcs => {
				var HereTmcs = here_tmcs.rows.map(tmc => {
					//let bestDifference = Infinity;

					let inrix_tmc = tmc.inrix_tmcs.split(',')[0]
						// .reduce((final, curr) => {
						// 	let inrixSpeedLimit = tmcLookup[curr].avg_speedlimit
						// 	let speedDifference = Math.abs(inrixSpeedLimit tmc
						// 	if(inrixSpeedLimit)

						// },null)
					//console.log('here tmcs', tmc.avg_speedlimit, tmcLookup[inrix_tmc].avg_speedlimit, tmc.avg_speedlimit -  tmcLookup[inrix_tmc].avg_speedlimit )
					let output = Object.assign({},tmcLookup[inrix_tmc])
					output.tmc = tmc.here
					output.length = tmc.length
					output.is_interstate = tmc.is_interstate
					return output
				})
				//.filter((d,i) => i < 1)
				TOTAL = HereTmcs.length
				bar = new ProgressBar('[:bar] :current/:total = :percent  :elapsed/:eta', { total: TOTAL });
				return Promise.map(HereTmcs, (tmc) => {
					return CalculateMeasures(tmc, YEAR)
				},{concurrency: 20})
				.then(measures => {
					var output = d3.csvFormat(measures)
					// console.log(measures)
					fs.writeFile(`${DIR}${STATE}_${YEAR}_${MEAN}_${TIME}.csv`, output, function(err) {
					    if(err) { return console.log(err) }
					    console.log("The file was saved!")
						return
					}); 			
					return
				})
			
			})
	})
