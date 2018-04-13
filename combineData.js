let toGeography = require('./utils/to_geography')
let CombineGeography = require('./utils/combine_geography')
let Promise = require('bluebird')

let DIR = `${__dirname}/data/ten/`

console.log(DIR)

const files = [
	'ny_2017_mean_3.csv',
	'ny_2016_mean_3.csv',
	'ny_2015_mean_3.csv',
	'nj_2017_mean_3.csv'
]

const files_two = [
	'ny_2017_mean_12.csv',
	'nj_2017_mean_12.csv',
	'ny_2018_mean_12.csv',
	'nj_2018_mean_12.csv'

]


const hereFiles = [
	'ny_2016_mean_3.csv',
	'ny_2015_mean_3.csv',
	'ny_2014_mean_3.csv',
]

Promise.map(files_two, (fileName) => {
			return toGeography(DIR,fileName)
		},{concurrency: 4})
	.then(outFiles => { 
		console.log(outFiles)
		return CombineGeography(DIR,outFiles)
	})
