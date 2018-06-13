let d3 = require('d3-dsv');
let fs = require('fs')
let Promise = require('bluebird')


// var fileName = `${DIR}${STATE}_${YEAR}_${MEAN}_${TIME}.csv`

function getData(DIR, fileName) {
	return new Promise(function (resolve, reject) {
		let STATE = fileName.split('_')[0]
		let YEAR = fileName.split('_')[1]
		console.log('read file',  DIR+fileName)
		fs.readFile( DIR+fileName, 'utf8', function (err, data) {
			let jsonData = d3.csvParse(data)
			let output = jsonData.reduce((out, curr) => {
					out[curr.tmc] = curr
					return out;
				},{})
			resolve(output)	
		})
	})
}


const dir_one = 'data/nine/'
const dir_two = 'data/ten/'
const filename_one = 'nj_2017_mean_3.csv'
const filename_two = 'nj_2017_mean_12.csv'

getData(dir_one,filename_one)
.then(data_one => {
	getData(dir_two,filename_two)
	.then(data_two => {

		let tmcs = Object.keys(data_one)

		tmcs
			.filter((d,i) => i < 40)
			.forEach(tmc => {
				//console.log('delay', data_one[tmc].d_total, data_two[tmc].d_total,  (+data_one[tmc].d_total) -  (+data_two[tmc].d_total) )
				console.log('vehicle delay', data_one[tmc].vd_total, data_two[tmc].vd_total,  (+data_one[tmc].vd_total) -  (+data_two[tmc].vd_total) )
				
			})

	})
})
