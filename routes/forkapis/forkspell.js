

/*START#############################################
#
#  Purpose  : to check for spelling in the html file using language tool and send the corrected spelling in response
#
#  Author   : Indhumathi R
#
#  Client   : SPS
#
#  Date     : Jan 22, 2021
#
*/
/*npm http for connecting with another endpoint*/
let http = require('http');
/*Function to get the unique values*/
/*config.json file for port & other server endpoint details*/
let url_port_details = require('../url_port_details.js');
function getUnique(arr, comp) {
	const unique = arr
		.map(e => e[comp])
		.map((e, i, final) => final.indexOf(e) === i && i)
		.filter(e => arr[e]).map(e => arr[e]);
	return unique;
}


async function sendMultipleXml(message) {
	var input = message.data.input;
	var i_language = message.data.language;
	var vLanguage = 'en-US';
	var responseString = '';
	if (i_language != undefined) {
		var Language = {
			[i_language]: `${i_language.toLowerCase()}-${i_language}`
		}
		if (Language[i_language]) {
			if (i_language == 'En') {
				vLanguage = 'en-US';

			} else {
				vLanguage = 'en-US';

			}
		}

	}

	/*Using NPM http,the spelling from the content is sent to language tool server */
	http.get(url_port_details.spellServer + '?text=' + encodeURIComponent(input) + '&language=' + vLanguage + '&enabledRules=MORFOLOGIK_RULE_EN_US&enabledOnly=true', (resp) => {
		resp.setEncoding('utf8');
		resp.on("data", function (data) {
			responseString += data;
		});
		resp.on("end", () => {
			var json = JSON.parse(responseString).matches;
			var sug = [];

			/*To get the replacements and the suggestions for each word from the content*/
			json.forEach(function (e) {
				if (e.replacements.length < 4 && e.replacements.length != 0) {
					var suggestions = '';
					var errorWord = input.substring(e.offset, (e.offset + e.length));
					e.replacements.forEach(function (ele) {
						//console.log(ele)
						if (ele.value != '') {
							suggestions += (ele.value) + ",";
						}
						if (suggestions.includes("'") || suggestions.includes("('s)")) {
							suggestions = errorWord;
						}
					})

					suggestions = suggestions.substring(0, suggestions.length - 1)
					if (suggestions !== "") {
						sug.push({ findWord: errorWord, suggestions: suggestions });
					}
				}
			});
			/* to get the unique words from the suggestions */
			sug = (getUnique(sug, 'findWord'))
			//infoLogger.info(JSON.stringify(logmsg));
			process.send({ counter: { status: 200, msg: sug } });
			process.exit();
		});
	}).on('error', (err) => {
		/*Error in input content from the html file*/

		process.send({ counter: { status: 400, msg: err } });
		process.exit();
	}).end();
}

// receive message from master process
process.on('message', async (message) => {
	await sendMultipleXml(message);

});