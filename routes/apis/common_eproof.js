

const preprocessor = require('../utils/processor');
/* url_port_details.js file for port & other server endpoint details */
let url_port_details = require('../url_port_details');
const { fork } = require('child_process');
const _ = require('lodash');
var fs = require('fs');
let fun = require('../functions');
let path = require('path');
const requestIp = require('request-ip');
const IncomingForm = require("formidable").IncomingForm;


async function preProcessForNodi(req, res, query_body) {
    return new Promise(function (resolve, reject) {
        const forkJsUrl = `${url_port_details.forkPath}${query_body.Forkapipath}${'.js'}`;
        if (query_body.Forkapipath == 'forkgetMathQueries' || query_body.Forkapipath == 'forksort' || query_body.Forkapipath == 'forkspell' || query_body.Forkapipath == 'forkaffiliation' || query_body.Forkapipath == 'forkupload' || query_body.Forkapipath == 'forkusUk' || query_body.Forkapipath == 'forkauthor' || query_body.Forkapipath == 'forkreference') {
            var input = {
                data: query_body
            };

        }
        else {

            var Token = {
                'tk': query_body
            }

            var input = preprocessor.preProcessSentToToken(Token);

        }
        /* fork another process */
        const process = fork(forkJsUrl);
        /* send list of inputs to forked process */
        if (query_body.Forkapipath == 'forkGeneratePDF') {
            const clientIp = requestIp.getClientIp(req);
            var user_ip = clientIp.match(/\d+/g).join().replace(/,/g, '.');
            input['user_ip'] = user_ip;
        }
        process.send(input);
        // listen for messages from forked process
        process.on('message', (message) => {
            if (message) {
                if (forkJsUrl.includes("forkGeneratePDF")) {

                    (async () => {
                        // let databaseurl = require(url_port_details.dbPath + 'db');

                        const Generate_Token = { dbtype: 'nedb', 'tk': { token: input.token } };
                        var db = preprocessor.preProcessSentToToken(Generate_Token);
                        //  var db = databaseurl.db(input.token);
                        await fun.UpdateForFinalData(input.token, db);
                    })();
                } else
                    if (message.counter.status == 200) {
                        if (forkJsUrl.includes("forkgetsavehtml") || forkJsUrl.includes("forkgetDownload")) {
                            if (query_body.Htmlchar == undefined && forkJsUrl.includes("forkgetsavehtml")) {
                                fun.Time_Recording_LandingPage(query_body.token);
                            }
                            /*Download the html file from the filepath*/
                            res.download(message.counter.msg, path.basename(message.counter.msg), function (err) {
                                /*If error in downloading the html file from the filepath*/
                                if (err) {
                                    res.status(400).json({ Error: JSON.stringify(err) });
                                }
                            });
                        } else if (forkJsUrl.includes("forkGeneratePDF")) {

                            let fun = require('../functions');
                            fun.updateEndTime({ jour_no: input.jour_no, art_no: input.art_no, userID: input.user_id, endTime: dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss.l"), toolType: (input.type == "ce") ? "NODI" : "NODI-Corr" }, (result) => {
                                /*this should work only for cloud
                                 if(result){
                                     fun.trackMove({jour_no:payload[0].journal_no,art_no:payload[0].art_no,toolType:(payload[0].type == "ce")? "NODI":"NODI-Corr"})
                                 }
                                 */
                            });
                        } else {
                            res.status(200).send(message.counter.msg);

                        }
                    } else if (message.counter.status === 300) {
                        res.status(300).send(message.counter.msg);
                    } else if (message.counter.status === 404) {

                        res.status(404).send(message.counter.msg);
                    } else if (message.counter.status === 500) {
                        res.status(500).send(message.counter.msg);
                    }
                    else {
                        res.status(400).send({ "Error": message.counter.msg });
                    }
                res.on('finish', () => { process.kill() });
            } else {
                res.status(400).send('Unable to process the request');
            }
        })

    })
}


exports.GetToken = (req, res) => {

    let jwtToken = require('../token.js');
    var flag = true;
    var missing_field = '';

    if (req.query.type) {
        if (req.query.type == "ce" || req.query.type == "act") {
            var f_for_bks_jnls = ['jour_no', 'art_no', 'user_id'];

        } else if (type == "bk-ce" || type == "bk-act") {
            var f_for_bks_jnls = ['book_no', 'chapter_no', 'user_id'];
        }

        for (let elem of f_for_bks_jnls) {
            if (req.query[elem] != undefined && req.query[elem] != '') {
                flag = true;
            } else {
                flag = false;
                missing_field = elem;
                break;
            }
        }
        if (flag) {
            res.status(200).send(jwtToken.getEncrypt(req.query));

        } else {
            res.status(400).send(missing_field + ' parameter is missing');
        }
    } else {
        res.status(400).send(' type paramter is missing');

    }

}

exports.PostUpload = (req, res) => {
    const clientIp = requestIp.getClientIp(req);
    var user_ip = clientIp.match(/\d+/g).join().replace(/,/g, '.');

    var form = new IncomingForm();
    form.multiples = true;

    //const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        console.log(files)
        if (err) {
            res.status(400).send(err)
        } else {

            if (fields.type) {
                if (fields.type == "ce" || fields.type == "act" || fields.type == "ce-pgx" || fields.type == "act-pgx") {
                    var f_for_bks_jnls = ['jour_no', 'art_no', 'user_id', 'type'];
                    var jnls_bks_no = f_for_bks_jnls[0].jour_no; var art_chap_no = f_for_bks_jnls[1].art_no;

                }
                else if (fields.type == "bk-ce" || fields.type == "bk-act" || fields.type == "bk-ce-pgx" || fields.type == "bk-act-pgx") {
                    var f_for_bks_jnls = ['book_no', 'chapter_no', 'user_id', 'type'];
                    var jnls_bks_no = f_for_bks_jnls[0].book_no; var art_chap_no = f_for_bks_jnls[1].chapter_no;
                }
                for (let elem of f_for_bks_jnls) {

                    if (fields[elem] != '') {
                        flag = true;
                    } else {
                        flag = false;
                        missing_field = elem;
                        break;
                    }
                }
                if (flag) {
                    (async () => {
                        fields['user_ip'] = user_ip;
                        let inter_query = { 'Forkapipath': fields.Forkapipath, 'i_fields': fields, 'filesupload': files }
                        await preProcessForNodi(req, res, inter_query);
                    })();

                } else {
                    CreateLogForKibana(f_for_bks_jnls[2].user_id, "uploadFile-PMS", jnls_bks_no, art_chap_no, { 'message': { 'Error': missing_field + ' is undefined' } }, type, user_ip)
                    //   response.status(400).json({ 'Error': "art_no is undefined" });
                    res.status(400).send(missing_field + ' parameter is missing');

                }
            } else {
                res.status(400).send(' type paramter is missing');

            }
        }
    })

    function CreateLogForKibana(user_id, uploadFilefromportal, jour_no, art_no, message, type, user_ip) {
        return new Promise(function (resolve, reject) {
            logmsg = log4js.getLogInJSON(user_id, uploadFilefromportal, new Date(), jour_no, art_no, "NA", type, url_port_details.node_env, "NA", message, url_port_details.hostname, user_ip);
            infoLogger.info(JSON.stringify(logmsg));
            fun.logtoKibana(url_port_details.kibanaServer, logmsg);
        })

    }
}
exports.JobSheet = (req, res) => {
    let jwtToken = require('../token.js');
    var token = req.body.token;
    /* If token is not send in the request*/
    if (token == '' || token == undefined) {
        var book_no = req.body.book_no;
        var chapter_no = req.body.chapter_no;
        var art_no = req.body.art_no;
        var jour_no = req.body.journal_no;
        var type = req.body.type;
        var endUser = req.body.endUser;

        if (jour_no !== undefined && art_no !== undefined || chapter_no !== undefined && book_no !== undefined) {
            /* fork another process */
            if (type !== undefined && type !== '') {
                if (endUser !== undefined && endUser !== '') {
                    const process = fork(url_port_details.forkPath + 'forkjobsheet.js');
                    var input = {
                        "token": token,
                        "endUser": endUser,
                        "jour_no": jour_no,
                        "art_no": art_no,
                        "type": type,
                        "book_no": book_no,
                        "chapter_no": chapter_no,
                    }
                    /*send list of e-mails to forked process */
                    process.send(input);
                    /*listen for messages from forked process */
                    process.on('message', (message) => {
                        if (message !== undefined) {
                            if (message.counter.status == 200) {
                                res.status(200).send(message.counter.msg);
                            } else {
                                res.status(400).json({ Error: message.counter.msg });
                            }
                        } else {
                            res.status(400).json({ Error: 'Unable to process the request' });
                        }
                    });

                } else {
                    res.status(400).json({ Error: 'endUser parameter is missing' });

                }
            } else {
                res.status(400).json({ Error: 'type parameter is missing' });

            }
        } else {
            res.status(400).json({ Error: 'jour_no or art_no is empty || book_no or chapter_no is empty' });

        }


    } else {
        var payLoad = jwtToken.getCyper(token);
        if (payLoad != 0) {
            // fork another process
            const process = fork(url_port_details.forkPath + 'forkjobsheet.js');
            var input = {
                "jour_no": payLoad.journal_no,
                "art_no": payLoad.art_no,
                "type": payLoad.type,
                "book_no": payLoad.book_no,
                "chapter_no": payLoad.chapter_no,
            }
            // send list of e-mails to forked process
            process.send(input);
            // listen for messages from forked process
            process.on('message', (message) => {
                if (message !== undefined) {
                    if (message.counter.status == 200) {
                        res.status(200).send(message.counter.msg);
                    } else {
                        res.status(400).json({ Error: message.counter.msg });
                    }
                } else {
                    res.status(400).json({ Error: 'Unable to process the request' });
                }
            });
        }
    }
}

var EproofingEngine = function (req, res) {
    (async () => {
        if (_.isEmpty(req.query)) {
            var intefaceinput = req.body;
        } else {
            var intefaceinput = req.query;

        }
        await preProcessForNodi(req, res, intefaceinput);
    })();
};

exports.GetHtml = EproofingEngine;
exports.SaveHtml = EproofingEngine;
exports.UsUk = EproofingEngine;
exports.Reference = EproofingEngine;
exports.Author = EproofingEngine;
exports.Affiliation = EproofingEngine;
exports.Spell = EproofingEngine;
exports.GetSession = EproofingEngine;
exports.Sorting = EproofingEngine;
exports.GetXML = EproofingEngine;
exports.GetMath = EproofingEngine;
exports.GetQueries = EproofingEngine;
exports.ContentChecker = EproofingEngine;
exports.TrackChange = EproofingEngine;
exports.AutoEditTrackChange = EproofingEngine;
exports.AutoEditHtml = EproofingEngine;
exports.GetDownLoad = EproofingEngine;
exports.GeneratePDF = EproofingEngine;
exports.EsmService = EproofingEngine;
exports.SentToServer = EproofingEngine;
