/* eslint-disable */

const AggregateMeasureCalculator = require('../calculators/aggregatorMeasureCalculator');
const fiveteenMinIndexer = require('../calculators/fiveteenMinIndexer');
const CalculatePHED = require('../calculators/phed');
const getTMCFromDatabase = require('../tasks/getTestData/getTMCFromDatabase');

const state = 'ny'
const year = 2017
const tmc = "120N05397"
let tmcData = null

const getTestData = () => {
	return new Promise((resolve,reject) => {
		if(tmcData) {
			resolve(tmcData)
		}
		getTMCFromDatabase(state,year,tmc)
		.then(data => {
			tmcData = data
			resolve(data)
		})
	})
}

describe('Calculat PHED Test Suite', () => {
  	
  	test('data has on year or less', (done) => {
		getTestData().then(data => {
		 	expect(tmcData.data.length).toBeLessThanOrEqual(288*365)
			done()
		})
  	})

  	test('get fiveteen minute index', (done) => {
  		getTestData().then(data => {
  			let fiveteenMinuteData = fiveteenMinIndexer(data.attributes, data.data)
  			//console.log(fiveteenMinuteData)
  			expect(Object.keys(fiveteenMinuteData).length).toBeLessThanOrEqual(96*365)
			done()
  		})
  	})
})
