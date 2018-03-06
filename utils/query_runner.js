var DBService = require("./db_service");
module.exports = {
	QueryRunner,
	sendIt
}

function sendIt(res) {
	return function(error, result) {
		if (error) {
			console.log("~ERROR~")
			console.log(error)
			res.status(500).json({ error: error });
		}
		else {
			res.status(200).json(result);
		}
	}
}

function QueryRunner(sql, processor, cb) {
	var NUM_ACTIVE = 0,
		MAX_ACTIVE = 6,

		queryList = [],

		asSimpleBQ = false,
		popSingleResult = false,

		defaultProcessor = null,

		consoleLog = false,

		resultArray = [];

	if (arguments.length == 3) {
		var qObj = QueryObject(sql, processor);
		queryList.push(qObj);
	}
	else if (arguments.length == 2) {
		var qObj = QueryObject(sql);
		queryList.push(qObj);
		cb = processor;
	}
	else if (arguments.length == 1) {
		cb = sql;
	}

	var runner = {
		run: function() {
			queryRunner(null, []);
			return runner;
		},
		add: function(sql, processor) {
			if (arguments.length == 2) {
				var qObj = QueryObject(sql, processor);
				queryList.push(qObj);
			}
			else {
				var qObj = QueryObject(sql, defaultProcessor);
				queryList.push(qObj);
				res = processor;
			}
			return runner;
		},
		processor: function(p) {
			if (!arguments.length) {
				return defaultProcessor;
			}
			defaultProcessor = p;
			return runner;
		},
		asSimpleBQ: function(b) {
			if (!arguments.length) {
				return asSimpleBQ;
			}
			asSimpleBQ = b;
			return runner;
		},
		popSingleResult: function(b) {
			if (!arguments.length) {
				return popSingleResult;
			}
			popSingleResult = b;
			return runner;
		},
		consoleLog: function(b) {
			consoleLog = b;
			return runner;
		}
	}
	return runner;

	function queryRunner(error) {
		if (error) {
			return cb(error);
		}
		else if (queryList.length) {
			++NUM_ACTIVE;
			var queryObject = queryList.pop();
			DBService.runQuery(queryObject.sql, function(error, result) {
				if (result) {
					result = queryObject.process(result);
					resultArray = resultArray.concat(result);
				}
				--NUM_ACTIVE;
				queryRunner(error);
			})
		}
		else if (NUM_ACTIVE == 0) {
			if (asSimpleBQ) {
				resultArray = makeSimpleBqObject(resultArray);
			}
			if (popSingleResult) {
				resultArray = resultArray.pop();
			}
if (consoleLog)console.log("QUERY RUNNER: SENDING",resultArray)
			return cb(null, resultArray);
		}

		if (queryList.length && (NUM_ACTIVE < MAX_ACTIVE)) {
			queryRunner(error);
		}
	}
}
function QueryObject(sql, processor) {
	return {
		sql: sql,
		process: processor || ((d) => d.rows)
	}
}