let toGeography = require('./utils/to_geography')
let {
  DownloadTMCPM3
} = require('./utils/data_retrieval');
let Promise = require('bluebird')

let DIR = `${__dirname}/data/states/`

console.log(DIR)

const states = ["al", "ak", "as", "az", "ar", "ca", "co", "ct", "de", "dc", "fm", "fl", "ga", "gu", "hi", "id", "il", "in", "ia", "ks", "ky", "la", "me", "mh", "md", "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj", "nm", "ny", "nc", "nd", "mp", "oh", "ok", "or", "pw", "pa", "pr", "ri", "sc", "sd", "tn", "tx", "ut", "vt", "vi", "va", "wa", "wv", "wi", "wy"]

Promise.map(states, (state) => {
	return DownloadTMCPM3(state).then(data => {
		return new Promise((resolve, reject) => {

			let years = data.rows.reduce((out,curr) => {
				if(!out.includes(curr.year)){
					out.push(curr.year)
				}
				return out;
			},[])
			let files = []
			years.forEach(year => {

				tmcYear = data.rows.filter(tmc => tmc.year === year)
				console.log(state,year,tmcYear.length)
				
				toGeography.processGeography(state,year,DIR,tmcYear)
				.then(filename => {
					console.log('filename', filename)
					files.push(filename)
				})
			})
			
			resolve(files)	
		})
	})
},{concurrency: 1})
.then(outFiles => { 
	return console.log(outFiles)
	
})
