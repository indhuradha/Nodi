#!//d:/restapi/router/token.js

/*START#############################################
#
#  $Date:  2019/July/0712-09:28:00 $ 
#
#  $Revision: 1.0 $
#
#  Purpose  : Encrypt & decrypt methods of token using NPM crypto-js 
#
#  Author   : Ranjitha
#
#  Client   : SPS
#
#  Date     : July 12, 2019
#
*/

let CryptoJS = require("crypto-js");

module.exports =
{
	getCyper: function (ciphertext) {
		ciphertext = (ciphertext.replace(/-/g, '+'));
		ciphertext = (ciphertext.replace(/_/g, '/'));
		const keyutf = CryptoJS.enc.Utf8.parse('WcYk\\AKp');
		const iv = CryptoJS.enc.Base64.parse('WcYk\\AKp');
		const dec = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(ciphertext) }, keyutf, { iv: iv });
		try {
			const decryptedData = JSON.parse(CryptoJS.enc.Utf8.stringify(dec));
			if (JSON.stringify(decryptedData) != '') {
				//logmsg = log4js.getLogInJSON("tokenDecrypt", new Date(), decryptedData[0].journal_no, decryptedData[0].art_no, ciphertext, "NA", url_port_details.node_env, "NA", { 'message': { 'Success': decryptedData } });
				//infoLogger.info(JSON.stringify(logmsg));
				if (decryptedData[0].type == '' || decryptedData[0].type == undefined) {
					decryptedData[0].type = 'ce';
				}
				return decryptedData[0];
			}
			return 0;
		} catch{
			return null;
		}
		
	},
	getEncrypt: function (token) {
		var data = '';
		var type = token.type;
		if (type == '' || type == undefined) {
			type = 'ce';
		}
		if ((token.jour_no !== undefined && token.jour_no !== '') && (token.art_no !== undefined && token.art_no !== '') && token.user_id !== undefined) {
			data = [{ journal_no: token.jour_no, art_no: token.art_no, user_id: token.user_id, type: type }];
		} else if ((token.book_no !== undefined && token.book_no !== '') && (token.chapter_no !== undefined && token.chapter_no !== '') && token.user_id !== undefined) {
			data = [{ book_no: token.book_no, chapter_no: token.chapter_no, user_id: token.user_id, type: type }];
		}

		if(data == ''){
			ciphertext = 'jour_no | art_no | book_no |chapter_no | user_id  parameters are missing | empty';
		}else{
			
		const keyutf = CryptoJS.enc.Utf8.parse('WcYk\\AKp');
		const iv = CryptoJS.enc.Base64.parse('WcYk\\AKp');

		var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), keyutf, { iv: iv });
		ciphertext = ciphertext.toString();
		ciphertext = (ciphertext.replace(/\+/g, '-'));
		ciphertext = (ciphertext.replace(/\//g, '_'));
		}
		return ciphertext;

	}
}; 