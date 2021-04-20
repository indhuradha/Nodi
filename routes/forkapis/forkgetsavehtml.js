
/*START#############################################
#
#  Purpose  :Fork method js for gethtml.
#
#  Author   : Indhumathi R
#
#  Client   : Nodi
#
#  Date     : Jan 20, 2021
#
######################################################################END*/
const preprocessor = require('../utils/processor');
/* npm glob,path methods for services */
let fs = require('fs');


async function RenameAndwriteHtmlfile(dataFolderPath, contenttoSave) {
    return new Promise(function (resolve, reject) {
        fs.renameSync(dataFolderPath.dataFilePath + '/', dataFolderPath.dataFilePath + '-' + new Date().getTime() + '.bak');
        /*the html content send in the request are saved in the html file*/
        fs.writeFile(dataFolderPath.dataFilePath, contenttoSave, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(dataFolderPath);
            }
        })
    })
}


async function ForkGetHtml(payLoad) {
    const dataFolderPath = await preprocessor.preProcessGetDataFolder(payLoad);
    if (fs.existsSync(dataFolderPath.dataFilePath)) {
        try {
            var contenttoSave = payLoad.savecontent;
            if(contenttoSave == undefined){
                process.send({ counter: { msg: dataFolderPath.dataFilePath, status: 200 } });
                process.exit();
            }else{
                 /*If HTML content has START_OXE & END_OXE*/
                 if (contenttoSave.includes("<!--START_OXE-->") && contenttoSave.includes("<!--END_OXE-->")) {
                    contenttoSave = contenttoSave.replace(/<img([^>]+)>/gi, '<img$1/>');
                    contenttoSave = contenttoSave.replace(/&nbsp;/gi, '&#xa0;');
                    contenttoSave = contenttoSave.replace(/&nbsp;/gi, ' ');
                    await RenameAndwriteHtmlfile(dataFolderPath, contenttoSave);
                    /*HTML file is send in the request*/
                    process.send({ counter: { status: 200, msg: dataFolderPath.dataFilePath } })
                    process.exit();

                } /* If both START_OXE & END_OXE is  missing in the content*/
                else if (contenttoSave.includes("<!--START_OXE-->") == false && contenttoSave.includes("<!--END_OXE-->") == false) {
                    process.send({ counter: { status: 400, msg: "<!--START_OXE--> & <!--END_OXE--> is missing" } });
                    process.exit();
                } /* If END_OXE is missing in the content and START_OXE is present*/
                else if (contenttoSave.includes("<!--START_OXE-->") == true && contenttoSave.includes("<!--END_OXE-->") == false) {
                    process.send({ counter: { status: 400, msg: "<!--END_OXE--> is missing" } });
                    process.exit();
                } /*If START_OXE is missing in the content and END_OXE is present */
                else if (contenttoSave.includes("<!--START_OXE-->") == false && contenttoSave.includes("<!--END_OXE-->") == true) {
                    process.send({ counter: { status: 400, msg: "<!--START_OXE-->  is missing" } });
                    process.exit();
                }

            }
        } catch (e) {
            process.send({ counter: { status: 400, msg: e.toString() } });
            process.exit();

        }
    } else {
        process.send({ counter: { status: 400, msg: 'Folder/File not available for this token' } });
        setTimeout(function () { process.exit(); }, 1000);
    }

}

// receive message from master process
process.on('message', async (message) => {
    await ForkGetHtml(message)
});

