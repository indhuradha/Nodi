

/*npm formidable,fs-extra,glob,utf8,base-64,request,path methods for all the services*/
const IncomingForm = require("formidable").IncomingForm;
const fs = require('fs');
let glob = require('glob');
const utf8 = require('utf8');
var base64 = require('base-64');
var path = require('path');
var mkdirp = require('mkdirp');
let jwtToken = require('../token');
var axios = require('axios');
var qs = require('qs');
/*log4js function to save the all the logs in the file */
var log4js = require('../apis/log4fun');
var infoLogger = log4js.logger;
var errorlog = log4js.errorlogger;
var logmsg = " ";
/*To get the value of other server url details*/
let url_port_details = require('../url_port_details');


/* Method which is called from function.js file  */
let fun = require('../functions.js');

/*fuction to send logs to Kibana*/
function CreateLogForKibana(user_id, uploadFilefromportal, log_jnls_bk_chap, log_Art_chap_no, msg_input, type, user_ip, msgtext, statuscode) {
    logmsg = log4js.getLogInJSON(user_id, uploadFilefromportal, new Date(), log_jnls_bk_chap, log_Art_chap_no, "NA", type, url_port_details.node_env, "NA", msg_input, url_port_details.hostname, user_ip);
    infoLogger.info(JSON.stringify(logmsg));
    fun.logtoKibana(url_port_details.kibanaServer, logmsg);
}

/*fuction to copy file to its respective directory*/
function CopyFile(temp_path, data_folder, new_location, fs, msg_input, log_jnls_bk_chap, log_Art_chap_no, user_ip, url, fileName, endUser, user_id, type, arraval) {
    if (arraval == true) {
        if (fs.pathExistsSync(data_folder + '/')) {
            fs.renameSync(data_folder + '/', data_folder + '-' + new Date().getTime());
        }
    }
    mkdirp(data_folder + '/').then(function (jobsheetfilemade) {
        fs.copy(temp_path, new_location, function (err) {
            if (err) {
                CreateLogForKibana(user_id, "uploadFile-PMS", log_jnls_bk_chap, log_Art_chap_no, { 'message': { 'Error': err } }, type, user_ip)
            }
            /*File moved successfully condition*/
            else {
                /*NPM glob to read the xml file from the filepath*/
                if (new_location.includes("_Article") == true || new_location.includes("_Chapter") == true) {
                    fs.readFile(new_location, { encoding: 'utf-8' }, function (err, data) {
                        var html_forg_ile_path = fileName.split('.')[0];
                        /*connecting with  xml2htmlserver or xml2htmlcorrserver to convert the xml file to html file*/
                        var bytes = utf8.encode(data);
                        var base64data = base64.encode(bytes);
                        var bytes = utf8.encode(data);
                        var base64data = base64.encode(bytes);

                        var data = JSON.stringify({
                            "appname": "myapp",
                            "filename": path.basename(fileName),
                            "filecontent": base64data
                        });

                        var config = {
                            method: 'post',
                            url: url,
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            data: data
                        };

                        axios(config)
                            .then(function (response) {
                                console.log("--then")
                                var base64decode = base64.decode(response.data);
                                var utf8decode = utf8.decode(base64decode);
                                fs.writeFile(data_folder + '/' + html_forg_ile_path + '.html', utf8decode)
                                fs.writeFile(data_folder + '/' + html_forg_ile_path + '.html.org', utf8decode, function (err) {
                                    console.log("----111")
                                    if (err) {
                                        CreateLogForKibana(user_id, "uploadFile-PMS", log_jnls_bk_chap, log_Art_chap_no, { 'message': { 'Error': err } }, type, user_ip, err, 400)
                                        process.send({ "counter": { status: 400, "msg": err } });
                                        process.exit();
                                    }/*File successfully saved in the content*/
                                    else {
                                        console.log("----112")
                                        if (endUser == "pms" || endUser == undefined) {
                                            var msgtext = { 'Success': "Files Saved Successfully" };
                                        } else if (endUser == "api") {
                                            var TokenJson = (type == "ce" || type == "act") ? { jour_no: log_jnls_bk_chap, art_no: log_Art_chap_no, user_id: user_id, type: type } : { book_no: log_jnls_bk_chap, chapter_no: log_Art_chap_no, user_id: user_id, type: type }
                                            var msgtext = jwtToken.getEncrypt(TokenJson);
                                        }
                                        CreateLogForKibana(user_id, "uploadFile-PMS", log_jnls_bk_chap, log_Art_chap_no, { 'message': msg_input }, type, user_ip, msgtext, 200);
                                        process.send({ "counter": { status: 200, "msg": msgtext } });
                                        process.exit();
                                    }
                                })
                            })
                            .catch(function (error) {
                                console.log("--catch")
                                process.send({ "counter": { status: 400, "msg": error.toString() } });
                                process.exit();
                            });

                    })
                }
            }
        })
    })
}


async function sendUpload(opt) {
    var message = opt.data;
    var getFile = message.filesupload.file;
    // console.log(getFile)
    var type = message.i_fields.type;
    var endUser = message.i_fields.endUser;
    var Art_chap_Fname = "", Jobsheet_Fname = "";
    var year = new Date().getFullYear();
    var user_ip = message.i_fields.user_ip;
    var user_id = message.i_fields.user_id;
    if (type == '' || type == undefined) {
        type = 'ce';
    }
    if (type == 'ce' || type == 'act' || type == "ce-pgx" || type == "act-pgx") {
        var stage = (type == 'ce' || type == "ce-pgx") ? "200" : "300";
        log_jnls_bk_chap = message.i_fields.jour_no;
        log_Art_chap_no = message.i_fields.art_no;
        var url = (type == 'ce') ? url_port_details.xml2htmlServer : url_port_details.xml2htmlServerCorr;
        Jobsheet_Fname = log_jnls_bk_chap + "_" + year + "_" + log_Art_chap_no + "_JobSheet_" + stage + ".xml";
        var data_folder = url_port_details.uploadfilepath + url_port_details[type] + log_jnls_bk_chap + '/' + log_Art_chap_no;
        (type == "ce-pgx" || type == "act-pgx") ? proccessPGX() : proccessSPR();
    } else if (type == 'bk-ce' || type == 'bk-act' || type == "bk-ce-pgx" || type == "bk-act-pgx") {
        var stage = (type == 'bk-ce' || type == 'bk-ce-pgx') ? "200" : "300";
        log_jnls_bk_chap = message.i_fields.book_no;
        log_Art_chap_no = message.i_fields.chapter_no;
        var url = (type == 'bk-ce') ? url_port_details.xml2htmlServerBooks : url_port_details.xml2htmlServerBooksCorr;
        Jobsheet_Fname = log_jnls_bk_chap + "_" + log_Art_chap_no + "_JobSheet_" + stage + ".xml";
        var data_folder = url_port_details.uploadfilepath + url_port_details[type] + log_jnls_bk_chap + '/' + log_Art_chap_no;
        (type == "bk-ce-pgx" || type == "bk-act-pgx") ? proccessPGX() : proccessSPR();
    } else {

        process.send({ "counter": { status: 404, "msg": "Please use valid type" } });

        process.exit();
    }
    function proccessSPR() {
        var arraval = Array.isArray(message.filesupload.file);
        const fs = require('fs-extra');
        if (arraval == true) {
            getFile.forEach(element => {
                var spltName = element.name.split("_");
                var temp_file_location = element.path;
                if (element.name.includes("_Article") == true || element.name.includes("_Chapter") == true) {
                    console.log("-----1")
                    Art_chap_Fname = element.name;
                    if (type == 'ce' || type == 'act') {
                        (spltName[1].length == 4) ? year = spltName[1] : year = year;
                        Art_chap_Fname = log_jnls_bk_chap + "_" + year + "_" + log_Art_chap_no + "_Article.xml"
                    }

                    var msg_input = { 'Success': "Files Uploaded Successfully(xml)" };
                    CopyFile(temp_file_location, data_folder, data_folder + '/' + Art_chap_Fname, fs, msg_input, log_jnls_bk_chap, log_Art_chap_no, user_ip, url, Art_chap_Fname, endUser, user_id, type, arraval);
                } else if (element.name.includes("_JobSheet_")) {
                    console.log("-----2")
                    if (type == 'ce' || type == 'act') {
                        (spltName[1].length == 4) ? year = spltName[1] : year = year;
                        Jobsheet_Fname = log_jnls_bk_chap + "_" + year + "_" + log_Art_chap_no + "_JobSheet_" + stage + ".xml";
                    }
                    var msg_input = { 'Success': "Files Uploaded Successfully(xml+jobsheetxml)" };
                    CopyFile(temp_file_location, data_folder, data_folder + '/' + Jobsheet_Fname, fs, msg_input, log_jnls_bk_chap, log_Art_chap_no, user_ip, url, Jobsheet_Fname, endUser, user_id, type, arraval);
                }
            })
        } else {
            console.log("-----3")
            var temp_file_location = getFile.path;
            var spltName = getFile.name.split("_");
            Art_chap_Fname = getFile.name;
            if (type == 'ce' || type == 'act') {
                (spltName[1].length == 4) ? year = spltName[1] : year = year;
                Art_chap_Fname = log_jnls_bk_chap + "_" + year + "_" + log_Art_chap_no + "_Article.xml"
            }
            var msg_input = { 'Success': "Files Uploaded Successfully(xml)" };
            CopyFile(temp_file_location, data_folder, data_folder + '/' + Art_chap_Fname, fs, msg_input, log_jnls_bk_chap, log_Art_chap_no, user_ip, url, Art_chap_Fname, endUser, user_id, type, arraval);
        }
    }
    function proccessPGX() {

        const extract = require('extract-zip');

        const fs = require('fs-extra');

        if (fs.existsSync(data_folder)) {

            fs.renameSync(data_folder, data_folder + "_" + new Date().getTime());

        }
        console.log('data_folder 2',data_folder);

        fs.mkdirSync(data_folder, { recursive: true });
        console.log('-=-=-=',getFile);
        extract(getFile.path, { dir: data_folder }).then(() => {

            var baseFileName = "";

            if (type == "ce-pgx" || type == "act-pgx") {

                var files = fs.readdirSync(data_folder);

                var i = files.findIndex(e => /Article.xml/i.exec(e));

                if (i >= 0) {

                    baseFileName = files[i].replace(".xml", "");

                }

            } else {

                baseFileName = log_jnls_bk_chap + "_" + log_Art_chap_no + "_Chapter";

            }

            var xmlFileName = baseFileName + ".xml";

            if (fs.existsSync(data_folder + "/" + xmlFileName)) {

                axios.post(url, { appname: 'myapp', filename: xmlFileName, filecontent: fs.readFileSync(data_folder + "/" + xmlFileName, "base64") }).then((response) => {

                    var utf8Data = Buffer.from(response.data, "base64").toString('utf8');

                    fs.writeFileSync(data_folder + "/" + baseFileName + ".html", utf8Data);

                    fs.writeFileSync(data_folder + "/" + baseFileName + ".html.org", utf8Data);

                    if (endUser == "pms" || endUser == undefined) {

                        var msgtext = "Files Saved Successfully";

                    } else if (endUser == "api") {

                        var tempType = type.replace("-pgx", "");

                        if (tempType == "ce" || tempType == "act") {

                            var msgtext = jwtToken.getEncrypt({ jour_no: log_jnls_bk_chap, art_no: log_Art_chap_no, user_id: user_id, type: tempType });

                        } else {

                            var msgtext = jwtToken.getEncrypt({ book_no: log_jnls_bk_chap, chapter_no: log_Art_chap_no, user_id: user_id, type: tempType });

                        }
                    }

                    process.send({ "counter": { status: 200, "msg": msgtext } });

                    process.exit();

                }).catch((err) => {

                    process.send({ "counter": { status: 404, "msg": "Error from xml to html" } });

                    process.exit();
                });

            } else {

                process.send({ "counter": { status: 404, "msg": "xml file not exists" } });

                process.exit();

            }

        }).catch((err) => {

            process.send({ "counter": { status: 404, "msg": err.toString() } });
            process.exit();
        });

    }


}



process.on('message', async (message) => {
    await sendUpload(message);
});