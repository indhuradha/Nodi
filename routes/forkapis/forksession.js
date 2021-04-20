
/*To get the value of other server url details*/
let url_port_details = require('../url_port_details');
const preprocessor = require('../utils/processor');
var moment = require('moment');

async function ForkSession(payLoad) {
    try {
        const data_Path = await preprocessor.preProcessGetDataFolder(payLoad);
        var finddoc = data_Path.find_nedb_query;

        let current_time = moment().format('YYYY-MM-DD, hh:mm:ss a');

        var action = payLoad.action;

        var Datastore = require('nedb')
            , db = new Datastore({ filename: data_Path.ne_db_path });
        db.loadDatabase(function (err) {
            if (err) {
                process.send({ counter: { 'status': 400, 'msg': err } });
                process.exit();
            } else {
                // Now commands will be executed		

                db.find(finddoc, function (err, docs) {

                    if (docs.length > 0) {

                        let Create_New_session = { 'starttime': current_time, 'idle': 0, 'action': null, 'endtime': null }

                        const index = docs[0].Time.findIndex(item => item.endtime == null);

                        if (action == 'idle') {

                            docs[0].Time[index].idle = parseInt(docs[0].Time[index].idle) + 5;

                        } else {
                            // action : windowclose | savehtml | download xml | senttoserver | generatepdf 

                            docs[0].Time[index].action = action;
                            docs[0].Time[index].endtime = current_time;
                            docs[0].Time[index + 1] = Create_New_session;

                        }

                        db.update(finddoc, docs[0], function (err, numReplaced) {
                            db.find(finddoc, function (err, docs) {
                                if (err) {
                                    process.send({ counter: { 'status': 400, 'msg': JSON.stringify(err) } });
                                    process.exit();
                                } else {
                                    process.send({ counter: { 'status': 200, 'msg': 'data is updated' } });
                                    process.exit();
                                }
                            })

                        })
                    } else {
                        process.send({ counter: { 'status': 400, 'msg': 'No records found in db' } });
                        process.exit();

                    }
                })

            }

        });


    } catch (e) {
        console.log(e)
        process.send({ counter: { 'status': 400, 'msg': JSON.stringify(e) } });
        process.exit();

    }
}


// receive message from master process
process.on('message', async (message) => {
    await ForkSession(message);

});