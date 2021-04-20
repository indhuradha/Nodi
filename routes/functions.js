/*npm xml2js to convert xml to json format*/
let xml2js = require('xml2js');
/*token.js to get the decrypted data from the token */
let jwtToken = require('./token.js');
var moment = require('moment');
let fs = require('fs');

/* npm log4js for writing Information and error logs */
var log4js = require('./apis/log4fun.js');
var infoLogger = log4js.logger;
var errorlog = log4js.errorlogger;

var logmsg = " ";

var currentWeekNumber = require('current-week-number');

// var rp = require('request-promise');
var axios = require('axios');
var qs = require('qs');
const preprocessor = require('./utils/processor');

let url_port_details = require('./url_port_details');

async function ProcessingToken(token) {
	let current_time = moment().format('YYYY-MM-DD, hh:mm:ss a');
	let create_idle_time = [{ 'starttime': current_time, 'idle': 0, 'action': null, 'endtime': null }]
	payLoad = jwtToken.getCyper(token);
	console.log(payLoad)
	var type = payLoad.type;
	var userid = payLoad.user_id;
	if (type == "ce" || type == "act") {
		var Jnls_Bks = payLoad.journal_no;
		var Art_Chap = payLoad.art_no;
		//var db_path = url_port_details.filepath + url_port_details[type] + payLoad[0].journal_no + "/" + payLoad[0].art_no + '/' + payLoad[0].user_id + '_timedetails.db';
       var finddoc = { jour_no: Jnls_Bks, art_no:Art_Chap, user_id: userid }
		var sqlitedb_field = 'entrydate, jnl, art, userid, token, starttime, endtime, totalprocesstime, idletime , type'
	} else if (type == "bk-ce" || type == "bk-act") {

		var Jnls_Bks = payLoad.book_no;
		var Art_Chap = payLoad.chapter_no;
		//var db_path = url_port_details.filepath + url_port_details[type] + payLoad[0].book_no + "/" + payLoad[0].chapter_no + '/' + payLoad[0].user_id + '_timedetails.db';
       var finddoc = { book_no: Jnls_Bks, chapter_no: Art_Chap, user_id: userid }
		var sqlitedb_field = 'entrydate, book, chapter, userid, token, starttime, endtime, totalprocesstime, idletime , type'
	}
	var db_path = url_port_details.filepath + url_port_details[type] + Jnls_Bks + "/" +Art_Chap + '/' + userid + '_timedetails.db';
	var create_idle_doc = {
        token: token,
        jour_no: payLoad.journal_no // Will not be saved
            ,
        art_no: payLoad.art_no // Will not be saved
            ,
        book_no: payLoad.book_no // Will not be saved
            ,
        chapter_no: payLoad.chapter_no // Will not be saved
            ,
        user_id: payLoad.user_id // Will not be saved
            ,
        type: type,
        Time: create_idle_time
	};
	return { db_path, finddoc, Jnls_Bks, Art_Chap, type, userid, create_idle_doc,sqlitedb_field };

}

async function ProcessingGet_h_m_s(docs) {
	//console.log('docs', docs[0].Time)

	let current_time = moment().format('YYYY-MM-DD, hh:mm:ss a');
	const index = docs[0].Time.findIndex(item => item.endtime === null);
	//console.log('---fun index', docs[0].Time[index].starttime, current_time)
	now = docs[0].Time[index].starttime;
	then = current_time;

	// start time and end time
	var startTime = moment(now.split(',')[1], "HH:mm:ss a");
	var endTime = moment(then.split(',')[1], "HH:mm:ss a");

	// calculate total duration
	var duration = moment.duration(endTime.diff(startTime));

	// duration in hours
	var hours = parseInt(duration.asHours());

	// duration in minutes
	var minutes = parseInt(duration.asMinutes()) % 60;
	//console.log(minutes, hours)
	return { minutes, hours, index };
}




module.exports = {
	nameToLowerCase: function (name) {
		return name.toLowerCase();
	},
	tagProcess: function (xml) {
		xml = xml.replace(/\n/g, '');
		xml = xml.replace(/\t/g, '');
		xml = xml.replace(/\s{2,}/g, '');
		xml = xml.replace(/<strong>/ig, 'boldopen');
		xml = xml.replace(/<b>/ig, 'boldopen');
		xml = xml.replace(/<em>/ig, 'emopen');
		xml = xml.replace(/<i>/ig, 'emopen');
		xml = xml.replace(/<\/strong>/ig, 'boldclose');
		xml = xml.replace(/<\/b>/ig, 'boldclose');
		xml = xml.replace(/<\/em>/ig, 'emclose');
		xml = xml.replace(/<\/i>/ig, 'emclose');

		xml = xml.replace(/\\ufeff/ig, "");
		return xml;
	},
	replaceTag: function (val) {
		val = val.replace(/boldopen/ig, '<b>');
		val = val.replace(/emopen/ig, '<i>');
		val = val.replace(/boldclose/ig, '</b>');
		val = val.replace(/emclose/ig, '</i>');
		val = val.replace(/<check>/ig, '');
		val = val.replace(/<\/check>/ig, '');
		return val;
	},

	tokenfun: function (token, envvar, content, response, apiname) {
		if (token == undefined || token == '') {
			logmsg = log4js.getLogInJSON(apiname, new Date(), "NA", "NA", "NA", token, envvar, content, { 'message': { 'Error': 'method was not supplied' } });
			//	errorlog.error(JSON.stringify(logmsg));
			return response.status(400).send(JSON.stringify({ 'ErrorCode': 'method was not supplied' }));
		} else if (content == undefined || content == '') {
			logmsg = log4js.getLogInJSON(apiname, new Date(), "NA", "NA", "NA", token, envvar, content, { 'message': { 'Error': 'content argument was not supplied' } });
			//	errorlog.error(JSON.stringify(logmsg));
			return response.status(400).send(JSON.stringify({ 'ErrorCode': 'content argument was not supplied' }));
		}
	},

	fundingInfoArticleCollecFun: function (method, token, envvar, content, response, apiname, jno, artno) {
		/*If method is not send in the request*/
		if (method == undefined || method == '') {
			logmsg = log4js.getLogInJSON(apiname, new Date(), jno, artno, token, method, envvar, content, { 'message': { 'Error': 'input method was not supplied' } });
			//	errorlog.error(JSON.stringify(logmsg));
			return response.status(400).send(JSON.stringify({ 'error': 'method was not supplied' }));
		}
		/*If content is not send in the request*/
		else if (content == undefined || content == '') {
			logmsg = log4js.getLogInJSON(apiname, new Date(), jno, artno, token, method, envvar, content, { 'message': { 'Error': 'content argument was not supplied' } });
			//	errorlog.error(JSON.stringify(logmsg));
			return response.status(400).send(JSON.stringify({ 'ErrorCode': 'content argument was not supplied' }));
        } else if (token == undefined || token == '') {
			logmsg = log4js.getLogInJSON(apiname, new Date(), jno, artno, token, method, envvar, content, { 'message': { 'Error': 'token argument was not supplied' } });
			//	errorlog.error(JSON.stringify(logmsg));
			return response.status(400).send(JSON.stringify({ 'ErrorCode': 'token was not supplied' }));
		}
	},

	affiAuthorxmltojson: function (token, envvar, content, apiname) {
		let jsonres = "";
		xml2js.parseString(content, {
            explicitArray: true,
            explicitCharkey: true,
            trim: true,
            charkey: '#',
            emptyTag: { "#": '' },
            attrkey: '@',
            preserveChildrenOrder: true,
            mergeAttrs: false,
            ignoreAttrs: false,
            charsAsChildren: true,
			explicitRoot: true
		}, (err, res) => {
			if (err) {
				console.log(err);
				//logmsg = log4js.getLogInJSON(apiname, new Date(), "NA", "NA", "NA", token, envvar, content, { 'message': { 'Error': err } });
				//	errorlog.error(JSON.stringify(logmsg));
				return JSON.stringify(err);
			}
			logmsg = log4js.getLogInJSON(apiname, new Date(), "NA", "NA", "NA", token, envvar, content, { 'message': 'success' });
			//	infoLogger.info(JSON.stringify(logmsg));
			jsonres = JSON.stringify(res);
			//console.log('jsonres',jsonres);
			
		});
		return jsonres;
	},

	logtoKibana: function (kibanaServer, logmsg) {

                        var data = JSON.stringify(logmsg)

                        var config = {
                            method: 'post',
							"url": kibanaServer + "/nodi-logs-2020-week-" + currentWeekNumber() + '/nodiapi/',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            data: data
                        };

                        axios(config)
                            .then(function (response) {
                                console.log("--then")
                              
                            })
                            .catch(function (error) {
                                console.log("--catch")
                                process.send({ "counter": { status: 400, "msg": error.toString() } });
                                process.exit();
                            });
		// try{
		// var options = {
		// 	"method": "POST",
		// 	"url": kibanaServer + "/nodi-logs-2020-week-" + currentWeekNumber() + '/nodiapi/',
		// 	'headers': {
		// 		'Content-Type': 'application/json'
		// 	},
		// 	body: JSON.stringify(logmsg)

		// };

		// rp(options, function (error, response) {
		// 	if (error) throw new Error(error);
		// 	return response.body;
		// });

		// }catch{
		// 	response.status(400).send({'ErrorCode': 'Error from kibana Server' });
		// }
	},

	usernameExists: function (payload) {
		var username = "";
		if (payload !== undefined) {
			console.log('username exists');
			username = payload;
		} else if (payload == 'unknown' || payload == undefined) {
			console.log('username not exists');
			username = 'unknown';
		}

		return username;
	},
	updateEndTime: function(data,cb){
		let body = {
			type:"sps",
			location:url_port_details.chennai.location,
			customer:url_port_details.chennai.customer,
			spData : `EXEC usp_SPR_Nodi_EndTime_Update '${data.jour_no}','${data.art_no}','${data.userID}','${data.endTime}','${data.toolType}'`
		}
		let option = {
			"method": "POST",
			"url": url_port_details.updateDB_url,
			'headers': {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body),
			rejectUnauthorized: false
			}
		rp(option, function (error, response) {
			try{
				console.log(`jour_no:${data.jour_no},art_no:${data.art_no},userID:${data.userID},time:${data.endTime} DB Response`,response.body)
				if(cb != undefined){cb(true)}
			}catch(e){
				console.log(`Error  jour_no:${data.jour_no},art_no:${data.art_no},userID:${data.userID},time:${data.endTime}`)
				if(cb != undefined){cb(false)}
			}
		});
	},
	processTimeUpdate:(data)=>{
        return new Promise((r) => {
		let body = {
			type:"sps",
			location:url_port_details.chennai.location,
			customer:url_port_details.chennai.customer,
			spData : `EXEC usp_SPR_Nodi_ProcessTime_Update  '${data.jour_no}','${data.art_no}','${data.time}','${data.toolType}','${data.userid}'`
		}
		let option = {
			"method": "POST",
			"url": url_port_details.updateDB_url,
			'headers': {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body),
			rejectUnauthorized: false
		} 

		rp(option, function (error, response) {
			try{
				console.log(`jour_no:${data.jour_no},art_no:${data.art_no},time:${data.time},user:${data.userid}, DB Response`,response.body)

			}catch(e){
				console.log(`Error  jour_no:${data.jour_no},art_no:${data.art_no},time:${data.time},user:${data.userid}`, error)
			}
                r();
            });
		});
	},
	trackMove: function(data){
		let body = {
			type:"sps",
			location:"spi-laguna",
			customer:url_port_details.chennai.customer,
			spData : `EXEC usp_SPR_PMS_Move_CeToPagination_ForCloud '${data.jour_no}','${data.art_no}','${data.toolType}'`
		}
		let option = {
			"method": "POST",
			"url": url_port_details.updateDB_url,
			'headers': {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body),
			rejectUnauthorized: false
		} 
		rp(option, function (error, response) {
			try{
				console.log(`jour_no:${data.jour_no},art_no:${data.art_no},ToolName:${data.toolType} DB Response`,response.body)
			}catch(e){
				console.log(`Error  jour_no:${data.jour_no},art_no:${data.art_no},ToolName:${data.toolType}`)
			}
		  });
	},
	Time_Recording_LandingPage: function (token) {
	//	console.log('Time_Recording_LandingPage',token)
		(async () => {
			let current_time = moment().format('YYYY-MM-DD, hh:mm:ss a');
			let update_idle_time = { 'starttime': current_time, 'idle': 0, 'action': null, 'endtime': null };
		//	const Generate_Token = { dbtype: 'nedb', 'tk': { 'token':token } };
			//var db = preprocessor.preProcessSentToToken(Generate_Token);
			//console.log('db----',db)
			let data_token = await ProcessingToken(token);
            var Datastore = require('nedb'),
                db = new Datastore({ filename: data_token.db_path });
			db.loadDatabase();
			// Now commands will be executed		

			db.find(data_token.finddoc, function (err, docs) {
				if (docs.length == 0) {
					console.log('current_time', current_time)
					db.insert(data_token.create_idle_doc, function (err, newDoc) {   // Callback is optional
						db.find(data_token.finddoc, function (err, docs) {
							console.log('gethtml create', docs[0].Time)
						})
					});

				} else {
					(async () => {
						let Get_h_m_s = await ProcessingGet_h_m_s(docs);
						G_index = Get_h_m_s.index;
						if (Get_h_m_s.minutes > 10) {
							docs[0].Time[G_index].endtime = docs[0].Time[G_index].starttime;
						} else {
							docs[0].Time[G_index].endtime = current_time;
						}
						docs[0].Time[G_index].action = 'internet down';
						docs[0].Time[G_index + 1] = update_idle_time;
						db.update(data_token.finddoc, docs[0], function (err, numReplaced) { // Callback is optional
							db.find(data_token.finddoc, function (err, docs) {
								//console.log('gethtml update', docs[0].Time)
							})
						})
					})();

				}
			})
		})();

	},

	UpdateForFinalData: function (token, sqlitedb) {
        return new Promise((r) => {
		(async () => {
			let current_time = moment().format('YYYY-MM-DD, hh:mm:ss a');
			let data_token = await ProcessingToken(token);
			if (fs.existsSync(data_token.db_path)) {

                    var Datastore = require('nedb'),
                        db = new Datastore({ filename: data_token.db_path });

                    db.loadDatabase(function (err) {
                        if (err) {
                            console.log(err);
                            r();
                        } else {
			db.find(data_token.finddoc, function (err, docs) {
				var currentSec = 0
				var idle_min = 0;
				if (docs.length > 0) {
						var arrleng = docs[0].Time.length;
					docs[0].Time.map((val, key) => {
						idle_min += parseInt(val.idle);
						if (val.endtime != null) {

							var startDate = new Date("" + val.starttime + "");
							var endDate = new Date("" + val.endtime + "");
							var diffMs = (endDate - startDate); // milliseconds between now & Christmas
							var milliseconds = parseInt((diffMs % 1000) / 100),
								seconds = Math.floor((diffMs / 1000) % 60),
								minutes = Math.floor((diffMs / (1000 * 60)) % 60),
								hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

							var diffHrs = (hours < 10) ? "0" + hours : hours;
							var diffMins = (minutes < 10) ? "0" + minutes : minutes;
							var diffSec = (seconds < 10) ? "0" + seconds : seconds;
							let outString = diffHrs + ":" + diffMins + ":" + diffSec


							var a = outString.split(':');
							var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
							currentSec = currentSec + seconds;
						}

						//console.log('key' , key , 'arrleng', arrleng)
						if (key + 1 == arrleng) {
							d = Number(currentSec);
						
							var h = Math.floor(d / 3600);
							var m = Math.floor(d % 3600 / 60);
							var s = Math.floor(d % 3600 % 60);
							var total_h_m_s = h + ":" + m + ":" + s;
							//console.log("send value to DB Total sec", total_h_m_s)
							//console.log('idle_min', idle_min)

							/*  to get idle calculation */
							var hours_idle = Math.floor(idle_min / 60)
							min_idle = idle_min % 60;
							let idle_total_h_m_s = [hours_idle, min_idle, 00].join(':');
							//console.log('idle_total_h_m_s', idle_total_h_m_s)
							/*  to get idle calculation */

							let inputDatas = [current_time, data_token.Jnls_Bks, data_token.Art_Chap, data_token.userid, token, docs[0].Time[0].starttime, docs[0].Time[arrleng - 1].starttime, total_h_m_s, idle_total_h_m_s, data_token.type]
                                    sqlitedb.run('INSERT INTO nodiTimeRecord(' + data_token.sqlitedb_field + ') VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', inputDatas, async(err, data) => {
								console.log('inserting in to Sqlite: ', inputDatas);
								console.log(err);
								//console.log('insert successfully created')
								if(data_token.create_idle_doc.jour_no !=undefined && data_token.create_idle_doc.art_no!=undefined){
									var tool = (data_token.type=="ce")? "NODI":"NODI-Corr";
                                            await module.exports.processTimeUpdate({ jour_no: data_token.create_idle_doc.jour_no, art_no: data_token.create_idle_doc.art_no, time: Math.floor(d / 60), toolType: tool, userid: data_token.userid })
								}
                                        r();
							})

						}
					})
					} else {
						console.log('No records in ', data_token.db_path);
                            r();
				}
			})

                        }

                    });
			} else {
				console.log(data_token.db_path, ' this file is missing');
                    r();
			}

		})();
        });
	}

};