

/*npm express framework*/
var express = require('express');
var app = express();
/*npm bodyparser to accept the json response */
let bodyParser = require('body-parser');
const morgan = require('morgan')
/*config.json file for port & other server endpoint details*/
let url_port_details = require('./url_port_details.js');


let g_t_details = require("./getTokenDetails");
let common_eproof = require("./apis/common_eproof.js");


app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));// support encoded bodies
app.use(bodyParser.json({ limit: '500mb', extended: true }));// support json encoded bodies

app.use(morgan('dev'))
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(function (err, req, res, next) {
  res.status(500).send('Something broke!')
});

app.use(bodyParser.json());

app.all('/', (req, res) => res.send('Welcome to the Nodi services. No exact details are provided'));


/*Endpoint URL for all the routes*/

app.get('/getHtml', common_eproof.GetHtml);
app.get('/getToken', common_eproof.GetToken);
app.get('/gettokendetails', g_t_details.GetTokenDetails);
app.post('/saveHtml', common_eproof.SaveHtml);
app.get('/getmath', common_eproof.GetMath);
app.post('/reference', common_eproof.Reference);
app.post('/author', common_eproof.Author);
app.post('/affiliation', common_eproof.Affiliation);
app.post('/upload', common_eproof.PostUpload);
app.post('/usukhyphenatedword',common_eproof.UsUk);
app.post('/spell', common_eproof.Spell);
app.post('/setIdleTime', common_eproof.GetSession);
app.post('/getSortAbbrivate', common_eproof.Sorting);
app.post('/jobsheet',common_eproof.JobSheet);
app.get('/getXML',common_eproof.GetXML);
app.get('/getQueries', common_eproof.GetQueries);
app.get('/contentChecker',common_eproof.ContentChecker);
app.get('/trackChange',common_eproof.TrackChange);
app.get('/autoEditTrackChange', common_eproof.AutoEditTrackChange);
app.get('/autoedithtml', common_eproof.AutoEditHtml);
app.get('/generatePDF', common_eproof.GeneratePDF);
app.get('/getDownload', common_eproof.GetDownLoad);
app.get('/esmService', common_eproof.EsmService);
app.get('/sentToServer', common_eproof.SentToServer);


module.exports = app


