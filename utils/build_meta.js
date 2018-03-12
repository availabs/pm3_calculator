let db_service = require('./db_service')
let ua_to_mpo = require('../data/meta/ua_to_mpo')

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

db_service.runQuery(sql, [], (err,data) => {
	if (err) reject(err)
	let output = {}
	data.rows.forEach(r => {
		if (r.geoType === 'state' || r.geoType === 'county'){
			r.geo = r.name
		}
		if(r.geoType === 'mpo' && ua_to_mpo[r.geo]){
			r.ua_code = ua_to_mpo[r.geo]
		}
		output[r.state + '_' + r.geo] = r
		

		
	})
	console.log(JSON.stringify(output))
})