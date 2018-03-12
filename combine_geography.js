let Promise = require('bluebird');
let d3 = require('d3-dsv');
let fs = require('fs')

const YEAR = '2017'
const STATE = 'nj'
const DIR = 'data/one/'
const MEAN = 'hmean'
const TIME = 'hour'

var files = [
	`ny_2017_geos.csv`,
	`ny_2016_geos.csv`,
	`ny_2015_geos.csv`,
	`nj_2017_geos.csv`,
]

Promise.map(files, (filename) => {
		return readFilePromise(DIR, filename)
	},{concurrency: 5})
	.then(datasets => {
		let output = {}
		datasets.forEach(dataset => {
			var year = dataset.year
			dataset.data.forEach(geo => {
				let key = `${geo.geo}_${geo.type}_${geo.state}`
				if(!output[key]) {
					output[key] = {
						geo: geo.geo,
						type: geo.type,
						state: geo.state,
						data:{}
					}
				}
				output[key].data[year] = geo
			})
		})
		var final = Object.keys(output).map(key => {
			return output[key]
		})
		fs.writeFile(`${DIR}final_geos.json`, JSON.stringify(final), function(err) {
		    if(err) { return console.log(err) }
		    console.log("The file was saved!")
			return
		});
	})

function readFilePromise(dir,filename) {
	return new Promise(function (resolve, reject) {
		fs.readFile( dir+filename, 'utf8', function (err, data) {
			if (err) {
				reject(err)
			}
			resolve({
				state: filename.split('_')[0],
				year: +filename.split('_')[1],
				data:d3.csvParse(data)
			})
		})
	})
}
