

let url_port_details = require('../url_port_details');
let fs = require('fs');
const utf8 = require('utf8');
var base64 = require('base-64');
/*log4js function to save the all the logs in the file */
var log4js = require('./../apis/log4fun');
var glob = require('glob');
var infoLogger = log4js.logger;
var errorlog = log4js.errorlogger;
var logmsg = " ";

/* Method which is called from function.js file  */
let fun = require('../functions.js');
let year = new Date().getFullYear();

/*GET METHOD FOR SENTTOSERVER*/
async function sentToserver(payload) {
    console.log(payload)
    // let token = message.token;
    // let user_ip = message.user_ip;
    // var jour_no = message.jour_no;
    // var art_no = message.art_no;
    // var userid = fun.usernameExists(message.userid);
    // var book_no = message.book_no;
    // var chapter_no = message.chapter_no;
    var type = payload.type;
    // let Read_html_filePath = "";
    // let htmlfilename = "";
    // let Write_xml_filepath = "";
    // let xmlfilename = "";
    // let jrnlFlag = 0;
    // let url = "";
    if (type == "ce" || type == "bk-ce") {
        var LE_Corr_Xml = 'LE.xml';
    } else if (type == "act" || type == "bk-act") {
        var LE_Corr_Xml = 'Corr.xml';
            }

    // if (type == "ce" || type == "act") {
    //         jrnlFlag = 1;
    //     url = (type == 'ce') ? url_port_details.html2xmlServerurl : url_port_details.html2xmlCorrServer;
    //     htmlfilename = jour_no + '_*_' + art_no + '_Article.html';
    //     xmlfilename = jour_no + "_*_" + art_no + '_Article.' + LE_Corr_Xml;
    //     Read_html_filePath = url_port_details.filepath + url_port_details[type] + jour_no + '/' + art_no + '/';
    //     Write_xml_filepath = url_port_details.filepath + url_port_details[type] + jour_no + '/' + art_no + '/';
    //     if (!fs.existsSync(Read_html_filePath)) {
    //         Write_xml_filepath = url_port_details.filepath + jour_no + "/" + art_no + "/";
    //         Read_html_filePath = url_port_details.filepath + jour_no + '/' + art_no + '/';
    //     }
    // } else if (type == "bk-ce" || type == "bk-act") {
    //     url = (type == 'bk-ce') ? url_port_details.html2xmlServerBooks : url_port_details.html2xmlServerBooksCorr;
    //         htmlfilename = book_no + '_' + chapter_no + '_chapter.html';
    //     Read_html_filePath = url_port_details.filepath + url_port_details[type] + book_no + '/' + chapter_no + '/';
    //     xmlfilename = book_no + "_" + chapter_no + '_Chapter.' + LE_Corr_Xml;
    //     Write_xml_filepath = url_port_details.filepath + url_port_details[type] + book_no + "/" + chapter_no + "/";
    // }
    // glob(Read_html_filePath + htmlfilename, (err, files) => {
    //     if (err || files == "") {
    //         process.send({ counter: { status: 400, msg: "HTML is not exists in the filepath" } });
    //         process.exit();
    //     } else {
    //         fs.readFile(files[0], { encoding: 'utf-8' }, function(err, data) {

    //             if (jour_no != undefined && art_no != undefined) {
    //                 htmlfilename = files[0].split("/").pop();
    //                 var year = htmlfilename.split("_")[1];
    //                 xmlfilename = xmlfilename.replace("*", year);
    //     }

    //             var bytes = utf8.encode(data);
    //             var base64data = base64.encode(bytes);
    //             var options = { method: 'POST', url: url, headers: { 'Content-Type': 'application/json' }, body: { appname: 'myapp', filename: htmlfilename, filecontent: base64data }, json: true };
   
    //             rp(options, function (error, html2xmlServerresponse, body) {
    //            try{
    //                 /* If error from html2xml server */
    //                 if (error || html2xmlServerresponse.statusCode == 500) {
    //                     process.send({ counter: { status: 400, msg: "There was an error from html to xml server" } });
    //                     process.exit();
    //                 } else {
    //                 /* decoding the response fromxmlOldfilepath the server using base64 and utf8 decode methods */
    //                     var base64decode = base64.decode(body);
    //                     var utf8decode = utf8.decode(base64decode);
    //                         fs.writeFile(Write_xml_filepath + xmlfilename, utf8decode, function(err) {
    //                         /*If error in writing the xml content in the file*/
    //                         if (err) {
    //                             process.send({ counter: { status: 400, msg: 'Error while writing file' } });
    //                             process.exit();
    //                         }
    //                         if (jrnlFlag) {
    //                                 CopyXMLServer('jour_no', 'art_no', jour_no, art_no, type, Write_xml_filepath + xmlfilename, url_port_details.copyXMLServer, token, user_ip, userid);
    //                     } else {
    //                                 CopyXMLServer('book_no', 'chapter_no', book_no, chapter_no, type, Write_xml_filepath + xmlfilename, url_port_details.copyXMLServer, token, user_ip, userid);
    //                     }
    //                 });
    //             }
    //            }catch(e){
    //                 process.send({ counter: { status: 400, msg: "There was an error from html to xml server" } });
    //                 process.exit();
    //            }
    //         })
    //     })
    // }
  //  });
                        }

function CopyXMLServer(keyname_j_b, keyname_A_c, Jnls_bk_no, Art_chap_no, type, Write_xml_filepath, copyXMLServer, token, user_ip, userid) {
    
        var copyxml_options = {
                'method': 'POST',
            'url': copyXMLServer,
                'headers': {
                    'Content-Type': 'multipart/form-data'
                },
                formData: {
                    'file': {
                    'value': fs.createReadStream(Write_xml_filepath),
                        'options': {
                    'filename': Write_xml_filepath.split("/").pop(),
                            'contentType': null
                        }
                    },
                [keyname_j_b]: Jnls_bk_no,
                [keyname_A_c]: Art_chap_no,
                'type': type
                },
                rejectUnauthorized: false
            };
        rp(copyxml_options, function (error, copyXMLresponse, body) {
            try {
            if(error){
                process.send({ counter: { status: 400, msg: 'Error from copyXML server' } });
                process.exit();
            }else if (copyXMLresponse.statusCode == 200) {
                logmsg = log4js.getLogInJSON(userid, "sentToServer", new Date(), Jnls_bk_no, Art_chap_no, token, "NA", url_port_details.node_env, "NA", { 'Success': Write_xml_filepath + ' is copied Successfully to server' }, url_port_details.hostName, user_ip);
                                   infoLogger.info(JSON.stringify(logmsg));
                                   fun.logtoKibana(url_port_details.kibanaServer, logmsg);
                                    process.send({ counter: { status: 200, msg: copyXMLresponse.body } });
                                    process.exit();
                                } else if (copyXMLresponse.statusCode == 400) {
                                    process.send({ counter: { status: 400, msg: copyXMLresponse.body } });
                                    process.exit();
                                } else if (copyXMLresponse.statusCode == 404) {
                                    process.send({ counter: { status: 400, msg: 'Filepath is not exists' } });
                                    process.exit();
                                }
            } catch(e){
        process.send({ counter: { status: 400, msg: 'copyXMLServer is inactive' } });
        process.exit();
            }
        })

}

process.on('message', async (message) => {
    await sentToserver(message);
});