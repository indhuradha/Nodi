let jwttoken = require('../token.js');

let url_port_details = require('../url_port_details');

let fs = require('fs');
const utf8 = require('utf8');
var base64 = require('base-64');
let glob = require('glob');
const preprocessor = require('../utils/processor');
var path = require('path');
var axios = require('axios');
var FormData = require('form-data');
var data = new FormData();
/*log4js function to save the all the logs in the file */
var log4js = require('./../apis/log4fun');
var infoLogger = log4js.logger;
var errorlog = log4js.errorlogger;
var logmsg = " ";

async function ReadPath(data_Path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(data_Path.dataFilePath, { encoding: 'utf-8' }, function (err, content) {
            var bytes = utf8.encode(content);
            var base64data = base64.encode(bytes);
            resolve(base64data);
        })
    })
}
async function WriteLEXmlCorrXml(xml_file_path,a_sever) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(xml_file_path, a_sever, function (err) {
            /*If error in writing the xml content in the file*/
            if (err) {
                process.send({ status: 400, "msg": "Error writing xml" });
                process.exit();
            } else {
                resolve(xml_file_path);
            }
        })
    })
}

async function html2xmlServer(data_Path, base64data,url) {
    return new Promise(function (resolve, reject) {
        var data = JSON.stringify({
            "appname": "myapp",
            "filename": path.basename(data_Path.data_File_Path),
            "filecontent": base64data
        });

        var config = {
            method: 'post',
            'url': url,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                var bytes = utf8.encode(response.data);
                var base64data = base64.encode(bytes);
                console.log("----then entry")
                resolve(base64data);

            })
            .catch(function (error) {
                //  console.log(error.status)
                process.send({ "counter": { status: 400, "msg": error.toString() } });
                process.exit();
            });
    })
}
async function PrepareCntServer(data_Path, data,xml_file_path,payLoad) {
    return new Promise(function (resolve, reject) {
        if (fs.existsSync(data_Path.Js_File_Path)) {
            console.log(`${data_Path.data_File_Path.split('.')[0]}.xml`)
            console.log(data_Path.Js_File_Name)
        
            data.append('user_id', payLoad.user_id);
            data.append('xmlfile', fs.createReadStream(xml_file_path), `${data_Path.data_File_Path.split('.')[0]}.xml`);
            data.append('jobsheetfile', fs.createReadStream(data_Path.Js_File_Path), data_Path.Js_File_Name);
            //  url: `${url_port_details.nodiSupportingServer}?api_type=nodi-indesign&pagination_trigger=false`,

            var config = {
                method: 'post',
                url: `${'http://10.110.24.78:8082/prepareContentForPDF'}?api_type=nodi-indesign&pagination_trigger=false`,
                headers: {
                    ...data.getHeaders()
                },
                data: data
            };

            axios(config)
                .then(function (response) {
                    process.send({ "counter": { status: 200, "msg": response.data } });
                    process.exit();
                })
                .catch(function (error) {
                    process.send({ "counter": { status: error.response.status, "msg": error.response.data } });
                    process.exit();
                });
        } else {

            process.send({ "counter": { status: 400, "msg": 'JobSheet is not exists in the filepath' } });
            process.exit();

        }

       
    })
}
async function CopyXMLServer(data_Path, data,xml_file_path,payLoad) {
    return new Promise(function (resolve, reject) {
        if (fs.existsSync(data_Path.Js_File_Path)) {
           // console.log(`${data_Path.data_File_Path.split('.')[0]}.xml`)
          //  console.log(data_Path.Js_File_Name)
            console.log(`${xml_file_path.split("/").pop()}`)
        
            data.append('file', fs.createReadStream(xml_file_path), `${xml_file_path.split("/").pop()}`);

            var config = {
                method: 'post',
                url: url_port_details.copyXMLServer,
                headers: {
                    ...data.getHeaders()
                },
                data: data
            };

            axios(config)
                .then(function (response) {
                    logmsg = log4js.getLogInJSON(payLoad.user_id, "sentToServer", new Date(), data_Path.jnls_bks_no, data_Path.art_chap_no, payLoad.token, "NA", url_port_details.node_env, "NA", { 'Success': xml_file_path + ' is copied Successfully to server' }, url_port_details.hostName, payLoad.user_ip);
                                   infoLogger.info(JSON.stringify(logmsg));
                                   fun.logtoKibana(url_port_details.kibanaServer, logmsg);
                    process.send({ "counter": { status: 200, "msg": response.data } });
                    process.exit();
                })
                .catch(function (error) {
                    process.send({ "counter": { status: error.response.status, "msg": error.response.data } });
                    process.exit();
                });
        } else {

            process.send({ "counter": { status: 400, "msg": 'JobSheet is not exists in the filepath' } });
            process.exit();

        }

       
    })
}

async function sendgeneratePDF(payLoad) {
    console.log(payLoad)
    var type = payLoad.type;
    const data_Path = await preprocessor.preProcessGetDataFolder(payLoad);
    var url = '';
    if (type == "ce" || type == "act") {
        url = (type == 'ce') ? url_port_details.html2xmlServerurl : url_port_details.html2xmlCorrServer;
    } else if (type == "bk-ce" || type == "bk-act") {
        url = (type == 'bk-ce') ? url_port_details.html2xmlServerBooks : url_port_details.html2xmlServerBooksCorr;
    }
    let html_cnt = await ReadPath(data_Path);
    let a_sever = await html2xmlServer(data_Path, html_cnt,url);
    /* decoding the response from the server using base64 and utf8 decode methods */
    if (type == "ce" || type == "act") {
        data.append('jour_no', payLoad.jour_no);
        data.append('art_no', payLoad.art_no);
        if (type == "ce") {
            xmlfilename = '.LE.xml';
        } else {
            xmlfilename = '.Corr.xml';
        }
    } else {
        data.append('book_no', payLoad.book_no);
        data.append('chapter_no', payLoad.chapter_no);

    }
    data.append('type', payLoad.type);
    var xml_file_path = data_Path.dataFilePath.split('.')[0] + xmlfilename;
    console.log(xml_file_path)
     await WriteLEXmlCorrXml(xml_file_path,a_sever);
     if(payLoad.servertype == 'pdf'){
        await PrepareCntServer(data_Path, data,xml_file_path,payLoad);
     }else{
        await CopyXMLServer(data_Path, data,xml_file_path,payLoad);

     }
    
}

process.on('message', async (message) => {
    await sendgeneratePDF(message);
});