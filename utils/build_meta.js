let db_service = require('../src/services/db_service')
let fs = require('fs')
let ua_to_mpo = require('../data/meta/ua_to_mpo')

const DIR = 'data/four/'

let sql = `
	SELECT 
		LOWER(text(geography_level)) as "geoType",
		geography_level_code as "geo", 
		geography_level_name as "name", 
        population_info as pop, 
        states[1] as state
  		FROM public.geography_level_attributes_view
  		where array_length(states, 1) = 1
  		and geography_level != 'REGION';`

var state_codes = {
	'ny': '36',
	'nj': '34'
}

db_service.runQuery(sql, [], (err,data) => {
	if (err) reject(err)
	let output = {}
	data.rows.forEach(r => {
		if (r.geoType === 'state'){
			r.geo = r.name
		}
		if (r.geoType === 'county'){
			r.geo = state_codes[r.state]+r.geo
		}
		if(r.geoType === 'mpo' && ua_to_mpo[r.geo]){
			r.ua_code = ua_to_mpo[r.geo]
		}
		output[r.state + '_' + r.geo] = r	
	})
	fs.writeFile(`${DIR}geo_meta.json`, JSON.stringify(output), function(err) {
	    if(err) { return console.error(err) }
	    console.log("The file was saved!")
		return
	});
	console.log()
})
