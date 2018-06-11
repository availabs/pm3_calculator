let d3 = require('d3-dsv');
let fs = require('fs');
let db_service = require('./src/services/db_service')

const YEAR = '2016'
const STATE = 'ny'
const IN_DIR = 'data/here_two/'
const OUT_DIR = 'data/here_three/'
const DEST_DIR = 'data/here_six/'

const MEAN = 'mean'
const TIME = '3'

var file1 = `${IN_DIR}${STATE}_2016_${MEAN}_${TIME}.csv`

var file2 = `${OUT_DIR}${STATE}_${YEAR}_${MEAN}_${TIME}.csv`

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};


const GetInterstateTMCs = function GetInterstateTMCs (fileName) {
	return new Promise(function (resolve, reject) {
		fs.readFile( fileName, 'utf8', function (err, data) {
			if(err) {
				reject(err)
			}
			var fullData = d3.csvParse(data)
			var tmcs = fullData
				.filter(d => (d.is_interstate === 'true' || d.is_intersate === ''))
				//.filter(d => +d.avg_speedlimit > 40 )
				.map(d => {
					//console.log(d)
					return d.tmc
				})
			resolve({
				tmcs,
				fullData
			})
		})
	})
}

GetInterstateTMCs(file1)
	.then(oldInterstate => {
		GetInterstateTMCs(file2)
		.then(newInterstate => { 

			let diff1 = newInterstate.tmcs.diff(oldInterstate.tmcs)
			let diff2 = oldInterstate.tmcs.diff(newInterstate.tmcs)
			let filteredData = newInterstate.fullData
				.filter(d => {
					return !diff2.includes(d.tmc) || (d.is_interstate === 'true' || d.is_intersate === '')
				})
			let csv = d3.csvFormat(filteredData)
			fs.writeFile(`${DEST_DIR}${STATE}_${YEAR}_${MEAN}_${TIME}.csv`, csv, function(err) {
			    if(err) { return console.log(err) }
			    console.log("The file was saved!")
				return
			});
		})		
	})

// fs.readFile( fileName, 'utf8', function (err, data) {
// 	var fullData = d3.csvParse(data)
// 	DownloadBadTmcs()
// 		.then(data => {
// 			var filterArray  = data.rows
// 				.map(d => d.tmc)

// 			//console.log('filterArray', filterArray)

// 			let filteredData = fullData
// 				.filter(d => {
// 					return !filterArray.includes(d.tmc)
// 				})
// 			console.log(fullData.length, filteredData.length)
// 			let csv = d3.csvFormat(filteredData)
// 	//console.log(out)
// 			fs.writeFile(`${OUT_DIR}${STATE}_${YEAR}_${MEAN}_${TIME}.csv`, csv, function(err) {
// 			    if(err) { return console.log(err) }
// 			    console.log("The file was saved!")
// 				return
// 			});
// 		})

// });

