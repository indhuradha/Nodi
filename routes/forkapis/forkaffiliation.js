

/*START#############################################
#
#  Purpose  :Fork method js for Affilation.
#
#  Author   : Indhumathi R
#
#  Client   : Nodi
#
#  Date     : Jan 20, 2021
#
######################################################################END*/

/*url_port_details.js file for port & other server endpoint details*/
let url_port_details = require('../url_port_details');
const preprocessor = require('../utils/processor');
let fun = require('../functions');
/*npm js2xmlparser to convert json to xml format */
let js2xmlparser = require("js2xmlparser");
/* npm fs for file reading and file writing operations in service */
let fs = require('fs');
var moment = require('moment');
/* npm xmldom to load and traverse through the xml */
let dom = require('xmldom').DOMParser;


async function processToXml(content, payLoad) {
    return new Promise(function (resolve, reject) {

        /* To get the CountryCode from CountryName*/
        if (content.affiliation.orgaddress !== undefined) {
            var countryName = content.affiliation.orgaddress[0].country[0]['#'];
            var jsondata = fs.readFileSync(__dirname + '/countrycode.json');
            let parsedjsondata = JSON.parse(jsondata);
            for (var i = 0; i < parsedjsondata.CountryNameandCode.length; i++) {
                if (parsedjsondata.CountryNameandCode[i].CountryName.toUpperCase() == countryName.toUpperCase()) {
                    content.affiliation.orgaddress[0].country[0]['@'] = { "code": parsedjsondata.CountryNameandCode[i].CountryCode }
                    break;
                }
            }
        }

        /*NPM js2xmlparser to convert jsontoxml*/
        var xml = js2xmlparser.parse('sample', content, { useSelfClosingTagIfEmpty: false, format: { doubleQuotes: true, pretty: true }, declaration: { include: false } });

        /*convert the xml to dom structure*/
        var doc = new dom().parseFromString(xml);

        /*to get the child nodes from the xml and exclude the sample tag */
        var nodes = doc.documentElement.childNodes;

        process.send({ counter: { status: 200, msg: nodes.toString() } });
        process.exit();

    })
}


async function Forkaffiliation(input) {
    try {
        var payLoad = input.data;

        if (payLoad.method == 'xmltojson') {
            /*Input XML content*/
            var data = payLoad.content.replace(/nogivenname/g, 'givenname');
            console.log(data)
            /*Function to convert input XML to JSON*/
            let resfromfun = fun.affiAuthorxmltojson(payLoad.method, url_port_details.node_env, data);

            process.send({ counter: { status: 200, msg: resfromfun } });
            process.exit();
        } else {
            var content = JSON.parse(payLoad.content);
            await processToXml(content, payLoad);

        }
    }
    catch (error) {
        console.log(error)
        process.send({ counter: { status: 400, msg: error } });
        process.exit();
    }
}

// receive message from master process
process.on('message', async (message) => {
    await Forkaffiliation(message);
});