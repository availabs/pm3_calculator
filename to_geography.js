let d3 = require('d3-dsv');
let fs = require('fs')

const YEAR = '2017'
const STATE = 'ny'
const GEO_TYPES = ['county','mpo','ua']
const MONTHS = ['total','jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

let VEHICLE_DELAY_DATAHOLDER = MONTHS.reduce((out,d,i) => {
	out[`vd_${YEAR}_${i}`] = 0
	return out
},{})

let DELAY_DATAHOLDER = MONTHS.reduce((out,d,i) => {
	out[`d_${YEAR}_${i}`] = 0
	return out
},{})

var fileName = `data/${STATE}_${YEAR}_hmean_hour_test.csv`

fs.readFile( fileName, 'utf8', function (err, data) {
	var fullData = d3.csvParse(data)
	// console.log(fullData[10000])
	// make a list of geographies
	var geographies = fullData.reduce((out,d) => {
		GEO_TYPES.forEach(geo => {
			if(!out[geo].includes(d[geo]) && d[geo] !== 'null'){
				out[geo].push(d[geo])
			}
		})
		return out
	},{county:[],mpo:[],ua:[], state:[STATE]})

	//console.log('geographies', geographies)
	// geographies = {county: ['Albany']}
	let output = Object.keys(geographies).map(geo_type => {
		let final = {}
		final[geo_type] = geographies[geo_type]
		.map(current_geo => {
			// console.log('current_geo', current_geo, geo_type)
			let current_geo_data = fullData
				.filter(d => geo_type === 'state' || d[geo_type] === current_geo)
				.reduce((out,d, ri) => {
					// console.log(d)
					MONTHS.forEach((month,i) => {
						// console.log(`vd_${month}`, +d[`vd_${month}`])
						out[`vd_${YEAR}_${i}`] += isNaN(+d[`vd_${month}`]) ? 0 : +d[`vd_${month}`]
						out[`d_${YEAR}_${i}`] += isNaN(+d[`d_${month}`]) ? 0 : +d[`d_${month}`]
					})
					var road_type = d.is_interstate === 'true'
						? 'interstate' : 'noninterstate'
					out[`${road_type}_tmcs`] += 1
					out[`${road_type}_mileage`] += +d.length
					return out
				},{ // default row
					geo: current_geo,
				 	type: geo_type,
				 	state: STATE,
				 	interstate_tmcs: 0,
				 	noninterstate_tmcs: 0,
				 	interstate_mileage: 0,
				 	noninterstate_mileage: 0,
				 	...VEHICLE_DELAY_DATAHOLDER,
				 	...DELAY_DATAHOLDER
				})
			return	current_geo_data	
		})
		return final
	})
	var csv = ''
	Object.keys(geographies).forEach((geo,i) =>{
		csv += d3.csvFormat(output[i][geo])
	})
	 
	console.log(csv)
})