/*START#############################################
#
#  Purpose  : Reads the token from the request and reads the HTML file and ORG file  from the filepath and sends changed html file  in the response using daisy diff jar
#
#  Author   : Ranjitha
#
#  Client   : SPS
#
#  Project  : Nodi(books & jnls)
#
#  Date     : May 05, 2020
#
END ###############################################*/

/* npm glob,path methods for services */
var fs = require('fs');
/*To get the value of other server url details*/
let url_port_details = require('../url_port_details');
const preprocessor = require('../utils/processor');
/* Method which is called from function.js file  */

async function ForkTrackChange(payLoad) {
    try {
        const data_Path = await preprocessor.preProcessGetDataFolder(payLoad);
        var org_file_path = `${data_Path.dataFilePath}.org`;
        if (fs.existsSync(org_file_path)) {
            var diff_path_name = `${data_Path.dataFilePath.split('.')[0]}_diff.html`;
            /*child_process exec method to  execute the java command */
            var exect = require('child_process').exec;

            /*daisydiff jar file filepath*/
            //let jarFile = url_port_details.filepath + 'daisydiff.jar';
            let jarFile = url_port_details.trackChange + 'daisydiff.jar';
            /*Java compiler command to execute daisy diff*/
            var compileit = 'java -jar ' + ' ' + jarFile + ' ' + org_file_path + ' ' + data_Path.dataFilePath + ' ' + '--file=' + diff_path_name;
            console.log(compileit)
            /*Childprocess exec method to execute the java command and save the changed html file in the filepath*/
            exect(compileit, { windowsHide: true }, function (error, stdout, stderr) {
                if (error) {
                    process.send({ counter: { status: '400', msg: "Error from execution command" } });
                    process.exit();
                }
                /*Response to send the changed html file*/
                process.send({ counter: { status: '200', msg: diff_path_name } });
                process.exit();
            });
        } else {
            process.send({ counter: { status: '400', msg: 'html.org file is not exists in the filepath' } });
            process.exit();

        }
    } catch (error) {
        process.send({ counter: { status: '400', msg: error.toString() } });
        process.exit();
    }
}

// receive message from master process
process.on('message', async (message) => {
    await ForkTrackChange(message);

});