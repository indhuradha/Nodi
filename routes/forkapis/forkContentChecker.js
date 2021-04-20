/* npm fa,request,xml2js,glob,utf8 and base64 methods for services */
let fs = require('fs');

let xml2js = require('xml2js');
// let glob = require('glob');
// const utf8 = require('utf8');
// var base64 = require('base-64');

/*To get the value of other server url details*/
let url_port_details = require('../url_port_details');
const preprocessor = require('../utils/processor');
const utf8 = require('utf8');
var base64 = require('base-64');
var path = require('path');
var axios = require('axios');
var contentcheckerresponse, contentCheckerbody, checkTexResponse, checkTexbody;
var count = 0;

async function sendContentChecker(payLoad) {
    /*To get the Payload from the Token*/
    const data_Path = await preprocessor.preProcessGetDataFolder(payLoad);
    console.log(data_Path.data_File_Path)
    let url = "";
    let xmlfilename = "";
    var type = payLoad.type;
    if (type == 'ce') {
        xmlfilename = '.LE.xml';
        url = url_port_details.html2xmlServerurl;
        content_checker_profile = "JWF_Article_200";
    } else if (type == 'act') {
        xmlfilename = '.Corr.xml';
        url = url_port_details.html2xmlCorrServer;
        content_checker_profile = "JWF_Article_300";
    }
    else if (type == 'bk-ce') {
        xmlfilename = '.LE.xml';
        url = url_port_details.html2xmlServerBooks;
        content_checker_profile = "BWF_Chapter_200";
    } else if (type == 'bk-act') {
        xmlfilename = '.Corr.xml';
        url = url_port_details.html2xmlServerBooksCorr;
        content_checker_profile = "BWF_Chapter_300";
    }
    fs.readFile(data_Path.dataFilePath, { encoding: 'utf-8' }, function (err, data) {
        // var html_forg_ile_path = data_Path.data_File_Path.split('.')[0];
        var xml_file_path = data_Path.data_File_Path.split('.')[0] + xmlfilename;
        var xml_full_path = data_Path.dataFilePath.split('.')[0];
        var bytes = utf8.encode(data);
        // var options = { method: 'POST', url: url, headers: { 'Content-Type': 'application/json' }, body: { appname: 'myapp', filename: filename + '.html ', filecontent: base64data }, json: true };
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
                let xmlencode = response.data;
                var base64decode = base64.decode(response.data);
                var utf8decode = utf8.decode(base64decode);
                console.log('xml_full_path + xmlfilename _  1', xml_full_path + xmlfilename)
                fs.writeFile(xml_full_path + xmlfilename, utf8decode, function (err) {
                    if (err) {
                        process.send({ status: 400, "msg": "error while writing file" })
                        process.exit();
                    }
                    console.log('xml_full_path + xmlfilename _  2', xml_full_path + xmlfilename)
                    var data1 = utf8decode.toString();
                    var config = {
                        method: 'post',
                        url: `${url_port_details.contentcheckerserverurl}?method=check&profile=${content_checker_profile}&filename=${xml_file_path}`,
                        headers: {
                            'Content-Type': 'text/plain'
                        },
                        data: data1
                    };
                    console.log(xml_file_path)

                    axios(config)
                        .then(function (response) {
                            contentcheckerresponse = { statusCode: 200 };
                            contentCheckerbody = response.data;
                            console.log('JSON.stringify(response.data)');
                        })
                        .catch(function (error) {
                            contentcheckerresponse = { statusCode: 500 };
                            contentCheckerbody = "";
                            console.log(error);
                        }).finally(() => {
                            sendResponse();
                        });

                    var data2 = JSON.stringify({
                        "appname": "myapp",
                        "filename": xml_file_path,
                        "filecontent": xmlencode
                    });

                    var config = {
                        method: 'post',
                        url: url_port_details.checkTexServer,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: data2
                    };

                    axios(config)
                        .then(function (response) {
                            checkTexResponse = { statusCode: 200 };
                            checkTexbody = response.data;
                            console.log('JSON.stringify(response.data)2');
                        })
                        .catch(function (error) {
                            checkTexResponse = { statusCode: 500 };
                            checkTexbody = "";
                            console.log('error2');
                        }).finally(() => {
                            sendResponse();
                        });
                });

            })
            .catch(function (error) {
                process.send({ "counter": { status: 400, "msg": error.toString() } });
                process.exit();
            });
    })


}


function sendResponse() {
    console.log("--finally entry",count,contentcheckerresponse,checkTexResponse)
    count++;
    if (count == 2) {
        if (contentcheckerresponse.statusCode == 200 && checkTexResponse.statusCode == 200) {
            var parseString = xml2js.parseString;

            parseString(contentCheckerbody, {
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
            }, (err, jsonbody) => {

                let checkTexBodyres = checkTexbody.result;
                var checktexbase64decode = base64.decode(checkTexBodyres);
                var checktexutf8decode = utf8.decode(checktexbase64decode);
                var array = checktexutf8decode.split('<br>');

                /* If error from content checker server */
                if (err) {
                    process.send({ status: 400, "msg": JSON.stringify(err) })
                    process.exit();
                }
                var jsonLog = jsonbody.DDSWebserviceResult.Log[0]['#'];

                var splittedLog = jsonLog.split("\n");
                process.send({ counter: { "ContentCheckerResponse": { "status": 200, "message": splittedLog }, "CheckTexResponse": { "status": 200, "message": array } } });

                process.exit();
            })

        } else if (contentcheckerresponse.statusCode == 200 && checkTexResponse.statusCode !== 200) {
            var parseString = xml2js.parseString;

            parseString(contentCheckerbody, {
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
            }, (err, jsonbody) => {


                /* If error from content checker server */
                if (err) {
                    process.send({ status: 400, "msg": JSON.stringify(err) })
                    process.exit();
                }
                var jsonLog = jsonbody.DDSWebserviceResult.Log[0]['#'];

                var splittedLog = jsonLog.split("\n");
                process.send({ counter: { "ContentCheckerResponse": { "status": 200, "message": splittedLog }, "CheckTexResponse": { "status": 400, "message": "Error from CheckTexServer" } }});
                process.exit();
            })

        } else if (contentcheckerresponse.statusCode !== 200 && checkTexResponse.statusCode == 200) {
            let checkTexBodyres = checkTexbody.result;
            var checktexbase64decode = base64.decode(checkTexBodyres);
            var checktexutf8decode = utf8.decode(checktexbase64decode);
            var array = checktexutf8decode.split('<br>');
            process.send({ counter: { "ContentCheckerResponse": { "status": 400, "message": "Error from ContentCheckerServer" }, "CheckTexResponse": { "status": 200, "message": array } }});
            process.exit();
        } else if (contentcheckerresponse.statusCode !== 200 && checkTexResponse.statusCode !== 200) {
            process.send({ counter: {  msg: {"ContentCheckerResponse": { "status": 400, "message": "Error from ContentCheckerServer" }, "CheckTexResponse": { "status": 400, "message": "Error from CheckTexServer" } }}});
            process.exit();
        }
    }
}

process.on('message', async (message) => {
    await sendContentChecker(message);
});