let d3 = require('d3-dsv');
let fs = require('fs')

const YEAR = '2014'
const STATE = 'ny'
const DIR = 'data/here_one/'
const MEAN = 'mean'
const TIME = '3'
const GEO_TYPES = ['county','mpo','ua']
const MONTHS = ['total',1,2,3,4,5,6,7,8,9,10,11,12]

let PERSON_DELAY_DATAHOLDER = MONTHS.reduce((out,d,i) => {
	out[`pd_${i}`] = 0
	return out
},{})

let VEHICLE_DELAY_DATAHOLDER = MONTHS.reduce((out,d,i) => {
	out[`vd_${i}`] = 0
	return out
},{})

let DELAY_DATAHOLDER = MONTHS.reduce((out,d,i) => {
	out[`d_${i}`] = 0
	return out
},{})

let TTR_DATAHOLER = {}
TTR_DATAHOLER[`lottr_interstate_miles_passing`] = 0
TTR_DATAHOLER[`lottr_noninterstate_miles_passing`] = 0
TTR_DATAHOLER[`tttr_interstate`] = 0

var fileName = `${DIR}${STATE}_${YEAR}_${MEAN}_${TIME}.csv`

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

	// console.log('geographies', geographies)
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
					if (+d.nhs === 1) {
						var avo = isNaN(+d.avg_vehicle_occupancy) ? 1.5 : +d.avg_vehicle_occupancy
						MONTHS.forEach((month,i) => {
							// console.log(`vd_${month}`, +d[`vd_${month}`])
							out[`d_${i}`] += isNaN(+d[`d_${month}`]) ? 0 : +d[`d_${month}`]
							out[`vd_${i}`] += isNaN(+d[`vd_${month}`]) ? 0 : +d[`vd_${month}`]
							out[`pd_${i}`] += isNaN(+d[`vd_${month}`]) ? 0 : +d[`vd_${month}`] * avo
							
						})
						let road_type = d.is_interstate === 'true'
							? 'interstate' : 'noninterstate'
						let lottr = Math.max(d.lottr_am,d.lottr_off,d.lottr_pm,d.lottr_weekend)
						let tttr = Math.max(d.tttr_am,d.tttr_off,d.tttr_pm,d.tttr_overnight,d.tttr_weekend)
						out[`${road_type}_tmcs`] += 1
						out[`${road_type}_mileage`] += +d.length
						//console.log(road_type, lottr)
						if (lottr < 1.5 ) {
							out[`lottr_${road_type}_miles_passing`] += +d.length
						}
						if (d.is_interstate === 'true' && d.length &&  !isNaN(+d.length)) {
							if(isNaN(tttr) || tttr === Infinity){
								tttr = 1
							}
							out[`tttr_interstate`] += +tttr * +d.length
							//console.log('tttr',tttr, +tttr * +d.length,out[`tttr_interstate`] )
						}	
					}
					return out
				},{ // default row
					geo: current_geo,
				 	type: geo_type,
				 	state: STATE,
				 	interstate_tmcs: 0,
				 	noninterstate_tmcs: 0,
				 	interstate_mileage: 0,
				 	noninterstate_mileage: 0,
				 	...TTR_DATAHOLER,
				 	...PERSON_DELAY_DATAHOLDER,
				 	...VEHICLE_DELAY_DATAHOLDER,
				 	...DELAY_DATAHOLDER
				})
			if ( current_geo_data.interstate_mileage === 0) {
				current_geo_data[`tttr_interstate`] = 0
			} else {
				console.log(current_geo_data[`tttr_interstate`], current_geo_data.interstate_mileage)
				current_geo_data[`tttr_interstate`] /= current_geo_data.interstate_mileage
			}
			// console.log(current_geo_data)
			//console.log(current_geo_data[`tttr_interstate`])
			return	current_geo_data	
		})
		return final
	})
	let allGeo = []
	Object.keys(geographies).forEach((geo,i) =>{
		//console.log(output[i][geo])
		allGeo = allGeo.concat(output[i][geo])
	})
	let csv = d3.csvFormat(allGeo)
	//console.log(out)
	fs.writeFile(`${DIR}${STATE}_${YEAR}_geos.csv`, csv, function(err) {
	    if(err) { return console.log(err) }
	    console.log("The file was saved!")
		return
	}); 
})