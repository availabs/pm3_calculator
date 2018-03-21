let d3 = require('d3-dsv');
let fs = require('fs');
let db_service = require('./utils/db_service')

const YEAR = '2015'
const STATE = 'ny'
const IN_DIR = 'data/five/'
const OUT_DIR = 'data/six/'

const MEAN = 'mean'
const TIME = '3'

var fileName = `${IN_DIR}${STATE}_${YEAR}_${MEAN}_${TIME}.csv`

fs.readFile( fileName, 'utf8', function (err, data) {
	var fullData = d3.csvParse(data)
	DownloadBadTmcs()
		.then(data => {
			var filterArray  = data.rows
				.map(d => d.tmc)

			//console.log('filterArray', filterArray)

			let filteredData = fullData
				.filter(d => {
					return !filterArray.includes(d.tmc)
				})
			console.log(fullData.length, filteredData.length)
			let csv = d3.csvFormat(filteredData)
	//console.log(out)
			fs.writeFile(`${OUT_DIR}${STATE}_${YEAR}_${MEAN}_${TIME}.csv`, csv, function(err) {
			    if(err) { return console.log(err) }
			    console.log("The file was saved!")
				return
			});
		})

});

const DownloadBadTmcs = function DownloadBadTmcs () {
	return new Promise(function (resolve, reject) {
		const sql = `
			select tmc from tmc_attributes 
			where state = 'ny'
			and tmc in 
			(select tmc from tmc_date_ranges where last_date <= '20170201');
    	`
      	//console.log(sql);	
	  	db_service.runQuery(sql, [], (err,data) => {
	  		if (err) reject(err)
	  		resolve(data)
	  	})
	})
}