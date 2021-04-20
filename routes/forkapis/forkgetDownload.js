
/* npm fs,request,glob,utf8 and base64 methods for services */
let fs = require('fs');
const utf8 = require('utf8');
var base64 = require('base-64');
/*log4js function to save the all the logs in the file */
var log4js = require('./../apis/log4fun.js');
var infoLogger = log4js.logger;
var errorlog = log4js.errorlogger;

var logmsg = " ";

/*To get the value of other server url details*/
let url_port_details = require('../url_port_details');

/* Method which is called from function.js file  */
let fun = require('../functions.js');
const preprocessor = require('../utils/processor');
var path = require('path');
var axios = require('axios');


var userid = "";


async function sendDownloadFile(payLoad) {
    const data_Path = await preprocessor.preProcessGetDataFolder(payLoad);
    if (fs.existsSync(data_Path.dataFilePath)) {
        var extension = ""; let url = "";
        var type = payLoad.type;
        if (type == "ce" || type == "bk-ce") {
            extension = "LE.xml";
            url = (type == 'ce') ? url_port_details.html2xmlServerurl : url_port_details.html2xmlCorrServer;
        } else if (type == "act" || type == "bk-act") {
            extension = "Corr.xml";
            url = (type == "bk-ce") ? url_port_details.html2xmlServerBooks : url_port_details.html2xmlServerBooksCorr;
        }
        var xml_file_name = `${data_Path.dataFilePath.split('.')[0]}.${extension}`;
        /* npm fs method to read the html content from th html file */
        fs.readFile(data_Path.dataFilePath, { encoding: 'utf-8' }, function (err, data) {
            if (err) {
                // endProcess(400, JSON.stringify(err), user_id, log_jour_book_no, log_art_chapter_no, token, type, user_ip);
            } else {
                /*/npm utf8 & base64 to encode the html content*/
                var bytes = utf8.encode(data);
                var base64data = base64.encode(bytes);
                var data = JSON.stringify({
                    "appname": "myapp",
                    "filename": path.basename(data_Path.data_File_Path),
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
                        console.log("-----entry if then",xml_file_name)
                        /*npm utf8 & base64 to decode the xml content*/
                        var base64decode = base64.decode(response.data);
                        var utf8decode = utf8.decode(base64decode);
                        /* npm fs method to write the xml content in the file   */

                        fs.writeFile(xml_file_name, utf8decode, function (err) {
                            /*If error in writing the xml content in the file*/
                            if (err) {
                                endProcess(400, "Error writing xml", user_id, log_jour_book_no, log_art_chapter_no, token, type, user_ip);
                            } else {
                               // var obj = (status == 200) ? { 'success': msg } : { 'error': msg };
                              //  process.send({ msg: xml_file_name, status: 200 });
                              //  process.exit();

                                process.send({ counter: { msg: xml_file_name, status: 200 } });
                                process.exit();
                                //  endProcess(200, xml_file_name, user_id, log_jour_book_no, log_art_chapter_no, token, type, user_ip);
                            }
                        });

                    })
                    .catch(function (error) {
                        console.log("---entry else catck")
                        process.send({ "counter": { status: 400, "msg": error.toString() } });
                        process.exit();
                    });
            }
        })
    }
}

function endProcess(status, msg, user_id, log_jour_book_no, log_art_chapter_no, token, type, user_ip) {
    var obj = (status == 200) ? { 'success': msg } : { 'error': msg };
    console.log(obj);
    //                 userid = fun.usernameExists(user_id);
    // logmsg = log4js.getLogInJSON(userid, "downloadXML", new Date(), log_jour_book_no, log_art_chapter_no, token, type, url_port_details.node_env, "NA", obj, url_port_details.hostName, user_ip);
    //                errorlog.error(JSON.stringify(logmsg));
    //                fun.logtoKibana(url_port_details.kibanaServer, logmsg);
    process.send({ msg: msg, status: status });
    process.exit();
}

process.on('message', async (message) => {
    await sendDownloadFile(message);
});