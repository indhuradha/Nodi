
var url_port_details = require('../url_port_details');
var axios = require('axios').default;

function processListESM(data) {
    console.log(data)
    var option = {
        url: url_port_details[data.serviceType + "_url"],
        qs: { type: data.type, location: data.location.split("-").shift() },
        rejectUnauthorized: false
    }
    setImmediate(() => {
        (data.serviceType == "esmRename") ? option.qs = Object.assign({ esmtype: data.esmtype, files: data.files }, option.qs) : null;
        (data.type.includes("bk")) ? option.qs = Object.assign({ book_no: data.book_no, chapter_no: data.chapter_no }, option.qs) : option.qs = Object.assign({ jour_no: data.jour_no, art_no: data.art_no }, option.qs);
        axios.get(option.url, { params: option.qs })
            .then(function (response) {
                (data.serviceType == "esmRename") ? process.send({ counter: { status: 200, msg: { files: response.data.message } } }) : process.send({ counter: { status: 200, msg: response.data.message } });
                ;
                process.exit();
            })
            .catch(function (error) { process.send({ counter: { status: 400, "msg": 'error from PrepareContentService' } });
            process.exit();
            });

    });
}

process.on('message', (data) => {
    processListESM(data);
})