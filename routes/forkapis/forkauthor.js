

/*START#############################################
#
#  Purpose  :Fork method js for gethtml.
#
#  Author   : Indhumathi R
#
#  Client   : Eproofing
#
#  Date     : April 12, 2020
#
######################################################################END*/

/*url_port_details.js file for port & other server endpoint details*/
const e = require('express');
let url_port_details = require('../url_port_details');
const preprocessor = require('../utils/processor');
let fun = require('../functions');
const { response } = require('../app');


/*npm js2xmlparser to convert json to xml format */
let js2xmlparser = require("js2xmlparser");
let fs = require('fs');
var moment = require('moment');

/*npm xml2js to convert xml to json format*/
let xml2js = require('xml2js');

/* npm xmldom to load and traverse through the xml */
let dom = require('xmldom').DOMParser;


var options = {
    useSelfClosingTagIfEmpty: false,
    format: { doubleQuotes: true, pretty: false },
    declaration: { include: false }
}

async function processToXml(data, payLoad) {
    return new Promise(function (resolve, reject) {
         if (data.author) {

        data.author.authorname.forEach(element => {
            if (element.givenname == undefined) {
                data.author.authorname = Object.assign({ nogivenname: [{ "#": "" }] }, element);
            }
        });
    } else if (data.institutionalauthor) { /*If input JSON has institutionalauthor*/
        if (data.institutionalauthor.author !== undefined) {
            data.institutionalauthor.author.forEach(element => {
                if (element.authorname.givenname == undefined) {
                    element.authorname.forEach(element2 => {
                        element.authorname = Object.assign({ nogivenname: [{ "#": "" }] }, element2);
                    })
                }
            });
        }
    }else{
        if (data.contact == undefined) {
            data.contact = Object.assign({ contact: [{ "#": "" }] });
        
        }

    }
    console.log(data.author.authorname)
    /*NPM js2xmlparser to convert jsontoxml*/
    var xml = js2xmlparser.parse('sample', data, { useSelfClosingTagIfEmpty: false, format: { doubleQuotes: true }, declaration: { include: false } });
    xml = xml.replace("\n", '');
    xml = xml.replace('<sample>', '');
    xml = xml.replace('</sample>', '');
   // xml = xml.replace('<contact/>', '<contact></contact>');
   // xml = xml.replace(/<givenname><\/givenname>/, '<nogivenname> </nogivenname>');
   console.log(xml)
        resolve(xml);
    })
}


async function Forkaq(input) {
    try {
        var payLoad = input.data;

        if (payLoad.method == 'xmltojson') {
            /*Input XML content*/
            var data = payLoad.content.replace(/nogivenname/g, 'givenname');
            /*Function to convert input XML to JSON*/
            let resfromfun = fun.affiAuthorxmltojson(payLoad.method, url_port_details.node_env, data, response);

            process.send({ counter: { status: 200, msg: resfromfun } });
            process.exit();
        } else {
            var content = JSON.parse(payLoad.content);
              let f_x_opt = await processToXml(content, payLoad);
              process.send({ counter: { status: 200, msg: f_x_opt.trim() } });
              process.exit();

        }
    }
    catch (error) {
        process.send({ counter: { status: 400, msg: error } });
        process.exit();
    }
}

// receive message from master process
process.on('message', async (message) => {
    await Forkaq(message);
});