
/* npm fa,request,xml2js,glob,utf8 and base64 methods for services */
let fs = require('fs');
const preprocessor = require('../utils/processor');


async function sendgetXML(payLoad) {
    const data_Path = await preprocessor.preProcessGetDataFolder(payLoad);
    //     /* variable of oldFilepath*/
    var extension = "";
    if (payLoad.type == "ce" || payLoad.type == "bk-ce") {
        extension = "LE.xml";
    } else if (payLoad.type == "act" || payLoad.type == "bk-act") {
        extension = "Corr.xml";
    }

    if (data_Path.dataFilePath) {
        var filePath = `${(data_Path.dataFilePath).split('.')[0]}.${extension}`;

        if (fs.existsSync(filePath)) {
            process.send({ counter: { status: 200, msg: filePath } });
            process.exit();
        } else {
            process.send({ counter: { status: 400, msg: 'xml file is not exists in the folder' } });
            process.exit();
        }

    } else {
        process.send({ counter: { status: 400, msg: 'Folder/File not available for this token' } });
        process.exit();
    }
}


process.on('message', async (message) => {
    await sendgetXML(message);
});