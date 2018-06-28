let {
  DownloadTMCData,
  DownloadTMCAtttributes,
  getTrafficDistribution
} = require('../../utils/data_retrieval');




const getTMCData = (STATE,YEAR,TMC) => {
	return new Promise((resolve,reject) => {
		DownloadTMCAtttributes(STATE).then(tmcs => {

			let tmcAttributes = tmcs.rows
		      .filter((d, i) => d.tmc === TMC)[0]

	      	DownloadTMCData(tmcAttributes.tmc, YEAR, STATE).then(tmcData => {
	       		//console.log(tmcAttributes.tmc, tmcData.rows[0], tmcData.rows.length)
	       		if(!tmcData) {
	       			reject({error: 'no data for tmc'})
	       		}
	       		resolve({
	       			attributes: tmcAttributes,
	       			data: tmcData.rows
	       		})
	      	})
		})
	})
}

module.exports = getTMCData

// getTMCData(state,year,tmc).then(data => {
// 	console.log('got the data', data.attributes, data.data.length, data.data[0])
// })