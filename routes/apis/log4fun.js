#!//d:/restapi/router/log4fun.js

/*START#############################################
#
#  $Date:  2019/November/0411-11:38:00 $ 
#
#  $Revision: 1.0 $
#
#  Purpose  : NPM log4js configuration for creating information and error logs in the project folder
#
#  Author   : Ranjitha
#
#  Client   : SPS
#
#  Date     : November 04, 2019
#
*/

/* NPM log4js*/
var log4js = require('log4js');

/*To get the value of other server url details*/
let url_port_details = require('../url_port_details');


/*log4js configuration for info and error logs in the project*/

var logconfig = log4js.configure({
  appenders: { default: { type: 'file', filename: url_port_details.logPath + '/nodi_api_info.log', pattern: '.yyyy-MM-dd', compress: true }, error: { type: 'file', filename: url_port_details.logPath + '/nodi_api_error.log', pattern: '.yyyy-MM-dd', compress: true } },
  categories: { default: { appenders: ['default'], level: 'info' }, error: { appenders: ['error'], level: 'error' } }
});

/*To get the log for default and error functions*/
const logger = log4js.getLogger('default');
const errorlogger = log4js.getLogger('error');

module.exports = {
  logger, errorlogger,
  getLogInJSON: function (user_id,api_name, date_time, j_no, art_no, token, method, env, content, message,hostname,user_ip) {

    var errojson = {
      "userid": user_id,
      "apiname": api_name,
      "@timestamp": date_time,
      "journalid": j_no,
      "articleid": art_no,
      "token": token,
      "method": method,
      "environment": env,
      "content": content,
      "message": message,
      "hostname" : hostname,
      "userip" : user_ip
    }
    return errojson;
  },

  getawssqsqueue: function (primary_id, secondary_id, category, type, time, queueURL) {

    let queuemessage = {
      "primary_id": {
        DataType: "String",
        StringValue: primary_id
      },
      "secondary_id": {
        DataType: "String",
        StringValue: secondary_id
      },
      "category": {
        DataType: "String",
        StringValue: category
      },
      "type": {
        DataType: "String",
        StringValue: type
      }
    }
     let messageBody = {
       "primary_id" : primary_id,
       "secondary_id" : secondary_id,
       "category" : category,
       "type" : type,
       "time" : time
     }

    var params = {
      // Remove DelaySeconds parameter and value for FIFO queues
      //    DelaySeconds: 10,
      MessageAttributes: queuemessage,
      MessageBody: JSON.stringify(messageBody),
      QueueUrl: queueURL
    }
    return params;
  }

}



/*######################################################################END*/



