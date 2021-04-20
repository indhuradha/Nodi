
/*START#############################################
#
#  Purpose  : to check for spelling in the html file using language tool and send the corrected spelling in response
#
#  Author   : Indhumathi R
#
#  Client   : SPS
#
#  Date     : Jan 21, 2021
#
*/
/*npm http for connecting with another endpoint*/
/*Function to get the unique values*/
/*  To get the US and UK word  */
let hyphenwordconfig = require('./usUk.json');

async function sendMultipleXml(message) {
	console.log(message)
	var content = message.data.content;
	var type = message.data.type;
	if (type === 'usUk') {
		/* entry USUK */
		var keys = ['USWORDS', 'UKWORDS-IZE', 'UKWORDS-ISE']
		var result = []; var keysarray = [];
		for (let i = 0; i < keys.length; i++) {
			var cat = "";
			result = [];
			/* get all sugesstion word  fron usuk json*/
			var usWords = Object.keys((hyphenwordconfig.usukconsistencycheck[0][keys[i]]));
			for (let a = 0; a < usWords.length; a++) {
				var suggestion = hyphenwordconfig.usukconsistencycheck[0][keys[i]][usWords[a]];
				/* Find findword */
				let regularExp = new RegExp('\\b' + usWords[a] + '\\b', 'g');
				let occurArray = (content.toLowerCase()).match(regularExp);
				/* get findword count */
				let count = (occurArray || []).length;
				cat = keys[i];
				if (count > 0) {
					result.push({
						'Count': count,
						'FindWord': usWords[a],
						"suggestion": suggestion
					})
				}
			}
			if (result.length > 0) {
				keysarray.push({
					[cat]: result
				})

			}
		}
		process.send({ counter: { status: 200, msg: keysarray } });
		process.exit();
	}
	else if (type === 'hypenWord') {
		/* entry hypenWord */
		let hypenregularExp = new RegExp(/((?:([a-zA-Z-0-9]+)-)+([a-zA-Z-0-9]+))/g);
		/* Find hypenated word */
		let hypenatedword = (content.toLowerCase()).match(hypenregularExp);
		var hypencount = {};
		var allHypenWordsAndCount = [];
		if (hypenatedword.length > 0) {
			hypenatedword.forEach(function (i) {
				hypencount[i] = (hypencount[i] || 0) + 1;
			});
			/*  hypenated word keys of array */
			Object.keys(hypencount).forEach(function (val) {
				/* Find no hypenated word */
				romovehypen = val.replace(/-/g, ' ');
				let removehypenregularExp = new RegExp('\\b' + romovehypen + '\\b', 'g');
				let remoccurArray = (content.toLowerCase()).match(removehypenregularExp);
				let nohypencount = (remoccurArray || []).length;

				/* Find closed hypenated word */
				romovespace = val.replace(/-/g, '');
				let removeSpaceRegularExp = new RegExp('\\b' + romovespace + '\\b', 'g');
				let remSpaceoccurArray = (content.toLowerCase()).match(removeSpaceRegularExp);
				let closedUpHypCount = (remSpaceoccurArray || []).length;
				allHypenWordsAndCount.push({
					'value': val, 'hypenWordsCount': hypencount[val], 'noHypenWordsCount': nohypencount, 'closedUpHypenWordsCount': closedUpHypCount
				})
			})
		}
		process.send({ counter: { status: 200, msg: allHypenWordsAndCount } });
		process.exit();

	} else {
		process.send({ counter: { status: 200, msg: 'error' } });
		process.exit();

	}

}

// receive message from master process
process.on('message', async (message) => {
	await sendMultipleXml(message);

});
