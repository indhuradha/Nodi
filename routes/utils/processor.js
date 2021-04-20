/*token.js to get the decrypted data from the token */
let jwtToken = require('../token');
const preprocessor = require('../utils/processor');
/*url_port_details.js file for port & other server endpoint details*/
let url_port_details = require('../url_port_details');
const { path } = require('../app');
/* To get the current date */
var year = new Date().getFullYear();
let fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
let glob = require('glob');


const GetForkinput = payLoad => {
   const PayValue = payLoad.keys;
   const dataval = payLoad.data;
   //   console.log('PayValue',PayValue)
   //   console.log('dataval',dataval)

   var input = {
      'book_no': PayValue.book_no, 'chapter_no': PayValue.chapter_no, 'jour_no': PayValue.journal_no, 'art_no': PayValue.art_no,
      'user_id': PayValue.user_id, 'token': dataval.tk.token, 'type': PayValue.type, 'savecontent': dataval.tk.Htmlchar,
      'method': dataval.tk.method, 'content': dataval.tk.content,'serviceType': dataval.tk.serviceType,'esmtype': dataval.tk.esmtype,
      'location': dataval.tk.location,'servertype':dataval.tk.servertype



   }
   return input;

}


exports.preProcessSentToToken = Token => {
   /* If token is not send in the request*/
   var FkProcess = '';
   if (Token.tk.token == '' || Token.tk.token == undefined) {
      FkProcess = 'Please check with token provided';
      return FkProcess;
   }
   else {
      /*To get the payload from the token*/
      var payLoad = jwtToken.getCyper(Token.tk.token);

      //  console.log('-=-=[-=[-=',payLoad)
      if (payLoad) {
         const url = {
            'keys': payLoad, 'data': Token

         }
         if (Token.dbtype == 'nedb') {
            db_path = url_port_details.filepath + url_port_details[payLoad.type] + "/" + 'jnls-nodi-time-records.data';
            FkProcess = new sqlite3.Database(db_path)

         } else {
            FkProcess = GetForkinput(url);

         }

      } else {
         FkProcess = 'Invalid Token';
      }
      return FkProcess;
   }
}


async function Get_Html_Path(g_dataFilePath) {
   return new Promise(function (resolve, reject) {
      //console.log('===outside ',g_dataFilePath)

      glob(g_dataFilePath, {}, (err, files) => {
         //console.log('==outside==',err)
         // console.log('--outside===',files)
         resolve(files[0])
      })
   })
}


exports.preProcessGetDataFolder = async (payLoad) => {
   if (payLoad) {
      var type = payLoad.type;
      console.log(url_port_details)
      console.log(type)
      var Js_File_Name = '';
      if (type == "ce" || type == "act") {
         var jnls_bks_no = payLoad.jour_no; var art_chap_no = payLoad.art_no;
         var data_File_Path = `${jnls_bks_no}_*_${art_chap_no}_Article.html`;
         var g_dataFilePath = `${url_port_details.filepath}${url_port_details[type]}${jnls_bks_no}/${art_chap_no}/${data_File_Path}`;
         var find_nedb_query = { jour_no: jnls_bks_no, art_no: art_chap_no, user_id: payLoad.user_id }
        var  dataFilePath = await Get_Html_Path(g_dataFilePath);
         if (dataFilePath != undefined) {
            if (dataFilePath.includes("_")) {
               var get_year = dataFilePath.split('_')[2];
            }
         }
         data_File_Path = `${jnls_bks_no}_${get_year}_${art_chap_no}_Article.html`;
        if(type == "ce"){
         Js_File_Name = `${jnls_bks_no}_${get_year}_${art_chap_no}_JobSheet_200.xml`;

        } else{
         Js_File_Name = `${jnls_bks_no}_${get_year}_${art_chap_no}_JobSheet_300.xml`;

        }
        var Js_File_Path = `${url_port_details.filepath}${url_port_details[type]}${jnls_bks_no}/${art_chap_no}/${Js_File_Name}`;
         var dataFolderPath = `${url_port_details.filepath}${url_port_details[type]}${jnls_bks_no}/${art_chap_no}/`;
      } else if (type == "bk-ce" || type == "bk-act") {
         var jnls_bks_no = payLoad.book_no; var art_chap_no = payLoad.chapter_no;
        // var jnls_bks_no = payLoad.bks_no; var art_chap_no = payLoad.chap_no;
         var data_File_Path = `${jnls_bks_no}_${art_chap_no}_Chapter.html`;
        // var data_pdf_Path = `${jnls_bks_no}_${art_chap_no}_AuthorFeedback`;
         var dataFilePath = `${url_port_details.filepath}${url_port_details[type]}${jnls_bks_no}/${art_chap_no}/${data_File_Path}`;

         var dataFolderPath = `${url_port_details.filepath}${url_port_details[type]}/${jnls_bks_no}/${art_chap_no}/`;
        // var dataFolder_book = `${url_port_details.filePath}${url_port_details[type]}${payLoad.stage}/${jnls_bks_no}/`;
        // var data_File_Path = `${jnls_bks_no}${art_chap_no}_Article.html`;
         var find_nedb_query = { book_no: jnls_bks_no, chapter_no: art_chap_no, user_id: payLoad.user_id }
      }
      console.log('dataFilePath---',dataFilePath)
      var ne_db_path = url_port_details.filepath + url_port_details[type] + jnls_bks_no + "/" + art_chap_no + '/' + payLoad.user_id + '_timedetails.db';
      return { dataFolderPath, dataFilePath, jnls_bks_no, art_chap_no, data_File_Path, get_year, ne_db_path, find_nedb_query,Js_File_Path,Js_File_Name };
   }

}