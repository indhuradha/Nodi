/* npm fs,glob,path methods for services */
let fs = require('fs');
const preprocessor = require('../utils/processor');

async function sendautoEditHtml(payLoad) {

    var contenttoSave = payLoad.Htmlchar;
    let htmltype = payLoad.htmltype;
    try {
        const data_Path = await preprocessor.preProcessGetDataFolder(payLoad);
        /*If HTML content has START_OXE & END_OXE*/
        if (contenttoSave.includes("<!--START_OXE-->") && contenttoSave.includes("<!--END_OXE-->")) {
            contenttoSave = contenttoSave.replace(/<img([^>]+)>/gi, '<img$1/>');
            contenttoSave = contenttoSave.replace(/&nbsp;/gi, ' ');
            var htmltype_file_name = `${data_Path.dataFilePath.split('.')[0]}_${htmltype}.html`;
            /*Filepath to get  the fileName*/
                fs.writeFile(htmltype_file_name, contenttoSave, function (err) {
                    /*error occurs in saving the html content fails*/
                    if (err) {
                        console.log(err);
                        process.send({ "counter": { status: 400, "msg": JSON.stringify(err) } });
                        process.exit();
                        next();
                    } else {
                        /*HTML file is send in the request*/
                        process.send({ "counter": { "msg": "success autoedit html", "value": htmltype_file_name } });
                        process.exit();
                    }
                });
            /*the html content send in the request are saved in the html file*/
        } /* If both START_OXE & END_OXE is  missing in the content*/
        else if (contenttoSave.includes("<!--START_OXE-->") == false && contenttoSave.includes("<!--END_OXE-->") == false) {
            process.send({ "counter": { status: 400, "msg": "<!--START_OXE--> & <!--END_OXE--> is missing" } });
            process.exit();
        } /* If END_OXE is missing in the content and START_OXE is present*/
        else if (contenttoSave.includes("<!--START_OXE-->") == true && contenttoSave.includes("<!--END_OXE-->") == false) {
            process.send({ "counter": { status: 400, "msg": "<!--END_OXE--> is missing" } });
            process.exit();
        } /*If START_OXE is missing in the content and END_OXE is present */
        else if (contenttoSave.includes("<!--START_OXE-->") == false && contenttoSave.includes("<!--END_OXE-->") == true) {
            process.send({ "counter": { status: 400, "msg": "<!--START_OXE--> is missing" } });
            process.exit();
        }
    }
    /*If autoedithtml is not found*/
    catch (e) {
        process.send({ "counter": { status: 400, "msg": e.toString() } });
        process.exit();

    }
}


process.on('message', async (message) => {
    await sendautoEditHtml(message);
});