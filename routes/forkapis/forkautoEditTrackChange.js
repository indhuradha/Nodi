
/* npm glob,path methods for services */
let glob = require('glob');

var fs = require('fs');
/*To get the value of other server url details*/
let url_port_details = require('../url_port_details');
const preprocessor = require('../utils/processor');

async function sendautoEditTrackChange(payLoad) {
    try {
        const data_Path = await preprocessor.preProcessGetDataFolder(payLoad);
        var beforeautoedithtml = `${data_Path.dataFilePath.split('.')[0]}_beforeAutoedit.html`;
        var afterautoedithtml = `${data_Path.dataFilePath.split('.')[0]}_afterAutoedit.html`;
        var diff_path_name = `${data_Path.dataFilePath.split('.')[0]}_Autoedit_diff.html`;
        if (fs.existsSync(beforeautoedithtml)) {
            if (fs.existsSync(afterautoedithtml)) {
                /*child_process exec method to  execute the java command */
                var exect = require('child_process').exec;

                /*daisydiff jar file filepath*/
                //let jarFile = url_port_details.filepath + 'daisydiff.jar';
                let jarFile = url_port_details.trackChange + 'daisydiff.jar';

                /*Java compiler command to execute daisy diff*/
                var compileit = 'java -jar ' + ' ' + jarFile + ' ' + beforeautoedithtml + ' ' + afterautoedithtml + ' ' + '--file=' + diff_path_name;
                /*Childprocess exec method to execute the java command and save the changed html file in the filepath*/
                exect(compileit, { windowsHide: true }, function (error, stdout, stderr) {
                    if (error) {
                        process.send({ "counter": { status: 400, "msg": "Error from execution command" } });
                        process.exit();
                    }
                    /*Response to send the changed html file*/
                    process.send({ "counter": { "msg": "successautoedittrackchange", "value": diff_path_name } });
                    process.exit();
                });
            } else {
                process.send({ "counter": { status: 400, "msg": "after autoedit file is not exists in the filepath" } });
                process.exit();

            }
        } else {
            process.send({ "counter": { status: 400, "msg": "before autoedit file is not exists in the filepath" } });
            process.exit();

        }
    } catch (error) {
        process.send({ "counter": { status: 400, "msg": "Please check with token provided" } });
        process.exit();
    }
}
process.on('message', async (message) => {
    await sendautoEditTrackChange(message);
});