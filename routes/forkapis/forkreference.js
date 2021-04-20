
/*START#############################################
#
#  Purpose  : Details of reference, xmltojson to jsontoxml formats from xml file(Fork Method)
#
#  Author   : Indhumathi
#
#  Client   : SPS
#
#  Project  : Nodi(books & jnls)
#
#  Date     : May 05, 2020
#
END ###############################################*/
/*config.json file for port & other server endpoint details*/
let urlPortConfig = require('../url_port_details.js');
/*  To get the JournalID & Styles  */
let CSLconfig = require('./csl.json');
/* npm xpath ,npm xmldom to load and traverse through the xml */
let xpath = require('xpath'), dom = require('xmldom').DOMParser;
let xml2js = require('xml2js');
/*npm js2zmlparser to convert json to xml format */
let js2xmlparser = require("js2xmlparser");
/* Transfer the data  */
// let http = require('http');
// let httprequest = require('request');
let fun = require('../functions.js');
// const utf8 = require('utf8');
/*T change the xml dom parser to xml string */
var XMLSerializer = require('xmldom').XMLSerializer;
const _ = require('lodash');
let http = require('http');
let httprequest = require('request');

var axios = require('axios');
var qs = require('qs');
var oSerializer = new XMLSerializer();
var staticBibType = ['bibarticle', 'bibbook', 'bibchapter'];
	var changeElement = ['NoInitials', 'Etal', 'Eds', 'NoArticleTitle', 'NoChapterTitle'];
	var errorOutput = [{
		"citation": {
			"@": { "id": 0 }, "type": [{ "#": "0" }],
			"bibarticle": [{ "bibauthorname": [{ "initials": [{ "#": "" }], "familyname": [{ "#": "" }] }, { "institutionalauthorname": [{ "#": "" }] }], "etal": [{ "#": "no" }], "year": [{ "#": "" }], "articletitle": [{ "#": "", "@": { "language": "En" } }], "journaltitle": [{ "#": "" }], "volumeid": [{ "#": "" }], "issueid": [{ "#": "" }], "firstpage": [{ "#": "" }], "lastpage": [{ "#": "" }], "bibarticledoi": [{ "#": "" }], "bibcomments": [{ "#": "" }] }],
			"bibbook": [{ "bibauthorname": [{ "initials": [{ "#": "" }], "familyname": [{ "#": "" }] }, { "institutionalauthorname": [{ "#": "" }] }], "etal": [{ "#": "no" }], "year": [{ "#": "" }], "booktitle": [{ "#": "" }], "EditionNumber": [{ "#": "" }], "editionnumber": [{ "#": "" }], "publishername": [{ "#": "" }], "publisherlocation": [{ "#": "" }], "firstpage": [{ "#": "" }], "lastpage": [{ "#": "" }], "bibbookdoi": [{ "#": "" }], "bibcomments": [{ "#": "" }] }],
			"bibchapter": [{ "bibauthorname": [{ "initials": [{ "#": "" }], "familyname": [{ "#": "" }] }, { "institutionalauthorname": [{ "#": "" }] }], "authoretal": [{ "#": "no" }], "year": [{ "#": "" }], "chaptertitle": [{ "#": "", "@": { "language": "En" } }], "bibeditorname": [{ "initials": [{ "#": "" }], "familyname": [{ "#": "" }], "particle": [{ "#": "" }], "suffix": [{ "#": "" }] }, { "bibinstitutionaleditorName": [{ "#": "" }] }], "editoretal": [{ "#": "" }], "eds": [{ "#": "" }], "booktitle": [{ "#": "" }], "confeventname": [{ "#": "" }], "confeventlocation": [{ "city": [{ "#": "" }], "country": [{ "#": "" }] }], "confeventdatestart": [{ "year": [{ "#": "" }], "month": [{ "#": "" }], "day": [{ "#": "" }] }], "confeventdateend": [{ "year": [{ "#": "" }], "month": [{ "#": "" }], "day": [{ "#": "" }] }], "seriestitle": [{ "#": "" }], "numberinseries": [{ "#": "" }], "editionnumber": [{ "#": "" }], "publishername": [{ "#": "" }], "publisherlocation": [{ "#": "" }], "firstpage": [{ "#": "" }], "lastpage": [{ "#": "" }], "bibchapterdoi": [{ "#": "" }], "bibcomments": [{ "#": "" }] }], "bibunstructured": [{ "#": "" }]
		}
	}];
var camelCaseBibType = {
	'bibauthorname': 'BibAuthorName',
	'year': 'Year',
	'articletitle': 'ArticleTitle',
	'journaltitle': 'JournalTitle',
	'volumeid': 'VolumeID',
	'issue': 'Issue',
	'firstpage': 'FirstPage',
	'lastpage': 'LastPage',
	'initials': 'Initials',
	'noinitials': 'NoInitials',
	'familyname': 'FamilyName',
	'institutionalauthorname': 'InstitutionalAuthorName',
	'bibcomments': 'BibComments',
	'issueid': 'IssueID',
	'bibarticledoi': 'BibArticleDOI',
	'etal': 'Etal',
	'authoretal': 'Etal',
	'editoretal': 'Etal',
	'noarticletitle': 'NoArticleTitle',
	'bibeditorname': 'BibEditorName',
	'booktitle': 'BookTitle',
	'editionnumber': 'EditionNumber',
	'publishername': 'PublisherName',
	'publisherlocation': 'PublisherLocation',
	'bibchapterdoi': 'BibChapterDOI',
	'bibbookdoi': 'BibBookDOI',
	'chaptertitle': 'ChapterTitle',
	'nochaptertitle': 'NoChapterTitle',
	'eds': 'Eds',
	'bibinstitutionaleditorname': 'BibInstitutionalEditorName',
	'particle': 'Particle',
	'suffix': 'Suffix',
	'confeventname': 'ConfEventName',
	'confeventlocation': 'ConfEventLocation',
	'city': 'City',
	'country': 'Country',
	'confeventdatestart': 'ConfEventDateStart',
	'month': 'Month',
	'day': 'Day',
	'confeventdateend': 'ConfEventDateEnd',
	'numberinseries': 'NumberInSeries',
	'seriestitle': 'SeriesTitle'
}
var bibTypeChildStaticArray = [{
	'bibarticle': ["bibauthorname", "etal", "year", "articletitle", "noarticletitle", "journaltitle", "volumeid", "issueid", "firstpage", "lastpage", 'bibarticlenumber', "bibarticledoi", "occurrence", "bibcomments"],
	'bibchapter': ['bibauthorname', 'authoretal', 'year', 'chaptertitle', 'nochaptertitle', 'bibeditorname', 'eds', 'editoretal', 'booktitle', 'editionnumber', 'confeventname', 'Confseriesname', 'confeventabbreviation', 'confnumber', 'confeventlocation', 'confeventdate', 'confeventdatestart', 'confeventdateend', 'seriestitle', 'numberinseries', 'publishername', 'publisherlocation', 'firstpage', 'lastpage', 'bibchapterdoi', 'bibbookdoi', 'occurrence', 'ISBN', 'bibcomments'],
	'bibbook': ['bibauthorname', 'bibeditorname', 'etal', 'year', 'booktitle', 'editionnumber', 'confeventname', 'confferiesname', 'confeventabbreviation', 'confnumber', 'confeventlocation', 'confeventdat', 'confeventdatestart', 'confeventdateend', 'seriestitle', 'numberinseries', 'confeventurl', 'publishername', 'publisherlocation', 'firstpage', 'lastpage', 'bibbookdoi', 'occurrence', 'ISBN', 'bibcomments']
}]
var nobibtypeelement = [{
	'bibarticle': ['articletitle'],
	'bibchapter': ['chaptertitle', 'seriestitle']
}]
var authAndEditsubchild = ['initials', 'familyname', 'particle', 'suffix']
var bibTypecamelCase = [{
    'bibarticle': 'BibArticle',
    'bibbook': 'BibBook',
    'bibchapter': 'BibChapter'
}];



function RenameElement(dom, xpathnode, nodeName) {
	var tmpNode;
	if (tmpNode = xpath.select(xpathnode, dom, true)) {
		/* need to check if it retunes multiple nodes */
		/* Need to get and set all attributes too */
		var newNode = dom.createElement(nodeName);
		var old_attributes = tmpNode.attributes;
		var new_attributes = newNode.attributes;

		for (var i = 0, len = old_attributes.length; i < len; i++) {
			new_attributes.setNamedItem(old_attributes.item(i).cloneNode());
		}

		/* copy child nodes  */
		if (tmpNode.hasChildNodes()) {
			do {
				newNode.appendChild(tmpNode.firstChild);
			}
			while (tmpNode.firstChild)
		}
		tmpNode.parentNode.replaceChild(newNode, tmpNode);
		/* replace element  */
		return 0;

	}
}
function cslwithRefBusCallback(newCiterefBusopt, dynamicBibTypeCamelCase,typetospan, type, refStyle) {
	var citecsloptdom = new dom().parseFromString(newCiterefBusopt.toString());

	/* Sorting bibtype's subchilds */
	for (x = 0; x < changeElement.length; x++) {
		var nodes = xpath.select("//" + changeElement[x], citecsloptdom);
		for (i = 0; i < nodes.length; i++) {
			var textElement = citecsloptdom.createTextNode(" ");
			nodes[i].appendChild(textElement);
		}

	}
	/* Sorting bibtype's subchilds */

	//Create citation node
	var citNode = xpath.select("//Citation", citecsloptdom);
	var newCite = citecsloptdom.createElement("div");
	newCite.setAttribute("class", "Citation");
	newCite.setAttribute("ID", citNode[0].getAttribute("ID"));
	/* Append Citation to Span */
	if (type !== '0') {
		var docSpan = new dom().parseFromString(typetospan);
		newCite.appendChild(docSpan)
	}
	/* Append Citation to Span */

	/* var newCite = citNode[0].cloneNode();*/
	var csloptbibtypechildnodes = xpath.select("//Citation/" + dynamicBibTypeCamelCase, citecsloptdom);
	var tempNode = csloptbibtypechildnodes[0].cloneNode(1);
	var bibStruct = citecsloptdom.createElement("div");
	bibStruct.setAttribute("class", "BibStructured");
	bibStruct.appendChild(tempNode);


	var bibUnStruct = xpath.select("//Citation/BibUnstructured", citecsloptdom);
	bibUnStruct[0].setAttribute("class", "BibUnstructured");
	RenameElement(citecsloptdom, "//Citation/BibUnstructured", "div");
	newCite.appendChild(bibStruct);
	var bibUnstruchild = xpath.select('//Citation/div[@class="BibUnstructured"]', citecsloptdom)[0];
	/* a tag changes to ExternalRef & emphasis tag changed based on the types like bold or italic */
	for (t = 0; t < bibUnstruchild.childNodes.length; t++) {
		const { nodeName, textContent } = bibUnstruchild.childNodes[t]
		if (nodeName !== '#text') {
			if (nodeName == 'a' || nodeName == 'ExternalRef') {

				var newRefTarget = citecsloptdom.createElement('span');
				newRefTarget.setAttribute('class', 'ExternalRef');
				var spanRefTarget = citecsloptdom.createElement('span');
				spanRefTarget.setAttribute('class', 'RefSource');
				if (nodeName == 'a')
					var Spandoi = citecsloptdom.createTextNode(bibUnstruchild.childNodes[t].getAttribute('href'));
				else {

					var Spandoi = citecsloptdom.createTextNode(bibUnstruchild.childNodes[t].textContent);
				}
				var Comretarget = citecsloptdom.createElement('span');
				Comretarget.setAttribute('targettype', 'DOI');

				if (nodeName == 'a') {
					let reftags = textContent;
					reftags = reftags.replace(/spslessersps/g, '%3c');
					reftags = reftags.replace(/spsgreaterersps/g, '%3e');
					Comretarget.setAttribute('address', reftags);

				}
				else {
					let reftags = bibUnstruchild.childNodes[t].childNodes[1].attributes[0].nodeValue;
					reftags = reftags.replace(/spslessersps/g, '%3c');
					reftags = reftags.replace(/spsgreaterersps/g, '%3e');

					Comretarget.setAttribute('address', bibUnstruchild.childNodes[t].getAttribute('href'));
				}
				Comretarget.setAttribute('class', 'RefTarget');
				var refTextcontent = citecsloptdom.createTextNode(' ');
				Comretarget.appendChild(refTextcontent)
				var Spandoicommand = citecsloptdom.createTextNode(Comretarget);
				spanRefTarget.appendChild(Spandoi)
				newRefTarget.appendChild(spanRefTarget)
				newRefTarget.appendChild(Spandoicommand)
				citecsloptdom.replaceChild(newRefTarget, bibUnstruchild.childNodes[t]);

			} else if (nodeName === 'Emphasis') {
				var empTypeattr = bibUnstruchild.childNodes[t].getAttribute('Type')
				if (empTypeattr === 'Bold') {
					var newEmphasis = citecsloptdom.createElement('b');

				} else {

					var newEmphasis = citecsloptdom.createElement('i');
				}

				var newEmphasisnodevalue = citecsloptdom.createTextNode(textContent);
				newEmphasis.appendChild(newEmphasisnodevalue)
				citecsloptdom.replaceChild(newEmphasis, bibUnstruchild.childNodes[t]);

			}

		}
	}

	/* a tag changes to ExternalRef & emphasis tag changed based on the types like bold or italic */
	newCite.appendChild(bibUnstruchild);
	var oSerializer = new XMLSerializer();
	var bibUnStrCnt = oSerializer.serializeToString(newCite);
	bibUnStrCnt = bibUnStrCnt.replace(/&lt;/g, '<');
	bibUnStrCnt = bibUnStrCnt.replace(/spslessersps/g, '&lt;');
	bibUnStrCnt = bibUnStrCnt.replace(/spsgreaterersps/g, '&gt;');
	bibUnStrCnt = bibUnStrCnt.replace(/spsandsps/g, '&amp;');

	process.send({ counter: { status: 200, msg: bibUnStrCnt } });
	process.exit();

}


async function ProcessingXmlToJsonConvertion(xml) {
    var parseString = xml2js.parseString;
			var DOMParser = require('xmldom').DOMParser;
			var parser = new DOMParser();
			var xmlDoc = parser.parseFromString(xml, 'text/xml');
			for (var g = 0; g < xmlDoc.documentElement.childNodes.length; g++) {
				const { nodeName, childNodes } = xmlDoc.documentElement.childNodes[g];
				if ("#text" !== nodeName) {
					for (var m = 0; m < childNodes.length; m++) {
						const { nodeName, textContent } = childNodes[m];
						if ("#text" !== nodeName) {
							/* To create Parent tag(bibauthor,bibeditor) for institutional tag */
							if (childNodes[m].toString().includes("institutional")) {
								if ('institutionalauthorname' === nodeName) {
									var newInstitutional = xmlDoc.createElement('bibauthorname');
								} else if ('bibinstitutionaleditorname' === nodeName) {
									var newInstitutional = xmlDoc.createElement('bibeditorname');
								}
								var newInstitutionalchild = xmlDoc.createElement(nodeName);
								var newInstitutionalchildtext = xmlDoc.createTextNode(textContent)
								newInstitutionalchild.appendChild(newInstitutionalchildtext);
								newInstitutional.appendChild(newInstitutionalchild);
								xmlDoc.documentElement.childNodes[g].replaceChild(newInstitutional, childNodes[m]);
							}
							/* To change noinitials to initials */
							else if (childNodes[m].toString().includes("noinitials")) {
								for (let k = 0; k < childNodes[m].childNodes.length; k++) {
									const { nodeName, textContent } = childNodes[m].childNodes[k];
									if (nodeName !== "#text") {
										if (nodeName === 'noinitials') {
											var newNoIntials = xmlDoc.createElement('initials');
										} else {
											var newNoIntials = xmlDoc.createElement(nodeName);

										}
										var textNode = xmlDoc.createTextNode(textContent);
										newNoIntials.appendChild(textNode);
										childNodes[m].replaceChild(newNoIntials, childNodes[m].childNodes[k]);

									}

								}
							}
							/* To change noinitials to initials */
							/* escape these (articletitle|journaltitle|chaptertitle|booktitle)  tag */
							else if (_.includes(nodeName, 'title') && (!_.includes(nodeName, 'no'))) {
								content = (childNodes[m]).toString()
								content = content.replace(/\<(articletitle|journaltitle|chaptertitle|booktitle)[^>]*\>/g, "");
								content = content.replace(/\<\/(articletitle|journaltitle|chaptertitle|booktitle)\>/g, "");
								var textNode = xmlDoc.createTextNode(content);
								var newartciletitle = xmlDoc.createElement(nodeName);
								newartciletitle.appendChild(textNode);
								xmlDoc.replaceChild(newartciletitle, childNodes[m]);
							}
							/* escape these (articletitle|journaltitle|chaptertitle|booktitle)  tag */
							/* Tag name changes etal to authoretal or editoretal */
							else if ('etal' === nodeName) {
								if (xmlDoc.documentElement.childNodes[g].nodeName !== 'bibarticle' && xmlDoc.documentElement.childNodes[g].nodeName !== 'bibbook') {
									if (childNodes[m - 1].nodeName === '#text') {
										if ((childNodes[m - 2].nodeName == 'bibauthorname' || childNodes[m - 4].nodeName == 'bibauthorname') || childNodes[m - 2].nodeName == 'institutionalauthorname') {
											var authoEtaltag = xmlDoc.createElement('authoretal');
										} else if ((childNodes[m - 2].nodeName == 'bibeditorname' || childNodes[m - 4].nodeName == 'bibeditorname') || childNodes[m - 2].nodeName == 'bibinstitutionaleditorname') {
											var authoEtaltag = xmlDoc.createElement('editoretal');
										}

									} else {
										if (childNodes[m - 1].nodeName === 'bibauthorname' || childNodes[m - 1].nodeName === 'institutionalauthorname') {
											var authoEtaltag = xmlDoc.createElement('authoretal');

										} else if (childNodes[m - 1].nodeName === 'bibeditorname' || childNodes[m - 1].nodeName === 'bibinstitutionaleditorname' || childNodes[m - 1].nodeName === 'eds') {
											var authoEtaltag = xmlDoc.createElement('editoretal');
										}
									}
								}
								else {
									var authoEtaltag = xmlDoc.createElement('etal');

								}

								var authoEtalTextcontent = xmlDoc.createTextNode('yes');
								authoEtaltag.appendChild(authoEtalTextcontent)
								xmlDoc.replaceChild(authoEtaltag, childNodes[m]);
							}
							/* Tag name changes etal to authoretal or editoretal */
							/* if eds is empty. Change eds textContent empty to yes */
							else if ('eds' === nodeName && textContent == ' ') {
								var neweds = xmlDoc.createElement('eds')
								var edstext = xmlDoc.createTextNode('yes')
								neweds.appendChild(edstext)
								xmlDoc.replaceChild(neweds, childNodes[m]);
							}
							/* if eds is empty. Change eds textContent empty to yes */
						}
					}

				}
			}
			var xmlToJsonOpt = oSerializer.serializeToString(xmlDoc);
			// /* convert xml to json using JsonParser */
			parseString(xmlToJsonOpt, {
				explicitArray: true, pretty: false,
				explicitCharkey: true, trim: true, charkey: '#', emptyTag: { "#": '' },
				attrkey: '@', preserveChildrenOrder: true, mergeAttrs: false, ignoreAttrs: false, charsAsChildren: true,
				valueProcesser: [fun.replaceTag], explicitRoot: true
			}, function (err, convertopt) {
				if (convertopt !== undefined) {
					if (convertopt.div !== undefined) {
						convertopt.citation = convertopt.div;
						delete convertopt.div
					}
					if (err) {
						process.send({ counter: { status: 404, msg: JSON.stringify(err) } });
						process.exit();
					}
					process.send({ counter: { status: 200, msg: convertopt } });
					process.exit();

				} else {
					process.send({ counter: { status: 400, msg: 'Cannot convert xml to json ' } });
					process.exit();

				}

			})
}


async function ProcessingJsonToXmlConvertion(stringToJson,payload,typetospan,dynamicbibtype,dynamicBibTypeCamelCase) {
    return new Promise(function (resolve, reject) {
       // (async () => {
           try{
             //  console.log(payload)

        /* Get bibtype  */
    var id = stringToJson.citation['@'].id
    var type = stringToJson.citation.type[0]['#']
      

        for (let h = 0; h < nobibtypeelement.length; h++) {
            if (_.get(nobibtypeelement[h][dynamicbibtype], 'length', false)) {
                for (let n = 0; n < nobibtypeelement[h][dynamicbibtype].length; n++) {
                    var checkwithoutkey = nobibtypeelement[h][dynamicbibtype][n]
                    if (stringToJson.citation[dynamicbibtype][0][checkwithoutkey] === undefined) {
                        stringToJson.citation[dynamicbibtype][0]['no' + checkwithoutkey] = [{ '#': '' }]
                    } else {
                        stringToJson.citation[dynamicbibtype][0][checkwithoutkey] = [{ "@": { "Language": "En" }, '#': stringToJson.citation[dynamicbibtype][0][checkwithoutkey][0]['#'] }]

                    }
                }
            }

        }
        var jsontoxml = js2xmlparser.parse('Citation', stringToJson, {
            useSelfClosingTagIfEmpty: false,
            format: { doubleQuotes: true, pretty: false },
            declaration: { include: false }
        });
        var doc = new dom().parseFromString(jsontoxml);
        var newCitation = doc.createElement(dynamicBibTypeCamelCase);
        /* Sorting BibType's Child & Subchilds */
        for (x = 0; x < bibTypeChildStaticArray.length; x++) {
            for (let z = 0; z < bibTypeChildStaticArray[x][dynamicbibtype].length; z++) {
                var nodes = xpath.select("//" + dynamicbibtype + "/" + bibTypeChildStaticArray[x][dynamicbibtype][z], doc);
                for (i = 0; i < nodes.length; i++) {
                    if (nodes[i].toString().includes("institutional")) {
                        newCitation.appendChild(nodes[i].firstChild);
                    } else if (nodes[i].toString().includes("familyname")) {
                        var keys = i + 1;
                        var NewBibSubChild = doc.createElement(nodes[i].nodeName)
                        for (let g = 0; g < authAndEditsubchild.length; g++) {
                            var subNodes = xpath.select("//" + dynamicbibtype + "/" + nodes[i].nodeName + "[" + keys + "]/" + authAndEditsubchild[g], doc);
                            for (let h = 0; h < subNodes.length; h++) {
                                if (subNodes[h].textContent === '') {
                                    var noinitialsnode = doc.createElement('no' + subNodes[h].nodeName);
                                    NewBibSubChild.appendChild(noinitialsnode)
                                } else {
                                    NewBibSubChild.appendChild(subNodes[h])
                                }
                            }
                        }
                        newCitation.appendChild(NewBibSubChild);
                    }
                    else {
                        if (nodes[i].nodeName == 'etal' || nodes[i].nodeName === 'authoretal' || nodes[i].nodeName === 'editoretal') {

                            if (nodes[i].textContent !== 'no') {
                                var etalNode = doc.createElement('etal');
                                var etalText = doc.createTextNode(' ');
                                etalNode.appendChild(etalText)
                                newCitation.appendChild(etalNode);
                            }

                        } else if (nodes[i].nodeName === 'eds' && nodes[i].textContent === 'yes') {
                            var edsNode = doc.createElement(nodes[i].nodeName);
                            var edsText = doc.createTextNode(' ');
                            edsNode.appendChild(edsText)
                            newCitation.appendChild(edsNode);
                        }
                        else {
                            newCitation.appendChild(nodes[i]);

                        }
                    }
                }
            }
        }

        /* Sorting BibType's Child & Subchilds */

        var newCitation = oSerializer.serializeToString(newCitation);
        var doc = new dom().parseFromString(newCitation.toString());

        /* Rename lowercase to camelcase */

        var nodes = xpath.select("//initials|//noinitials|//familyname|//particle|//suffix|//institutionalauthorname", doc);
        for (i = 0; i < nodes.length; i++) {
            var bibauth = '//' + dynamicBibTypeCamelCase + '/bibauthorname/' + nodes[i].nodeName
            var bibedit = '//' + dynamicBibTypeCamelCase + '/bibeditorname/' + nodes[i].nodeName
            RenameElement(doc, bibauth + "|" + bibedit, camelCaseBibType[nodes[i].nodeName]);
        }


        var nodes = xpath.select("//" + dynamicBibTypeCamelCase + "/*", doc);
        for (i = 0; i < nodes.length; i++) {
            RenameElement(doc, '//' + dynamicBibTypeCamelCase + '/' + nodes[i].nodeName, camelCaseBibType[nodes[i].nodeName]);
        }
        /* Rename lowercase to camelcase */



        var rootCitation = doc.createElement('Citation');
        var rootUnStr = doc.createElement('BibUnstructured');
        rootCitation.setAttribute('ID', id)
        if (CSLconfig[payload.referenceStyle] !== undefined && type !== '0') {
            var docSpan = new dom().parseFromString(typetospan);
            rootCitation.appendChild(docSpan)
        }
        /* CSL Service entry */

        var rootBib = doc.createElement('Bibliography');
        rootBib.setAttribute('ID', 'Bib1')
        doc.appendChild(rootUnStr)
        rootCitation.appendChild(doc)
        rootBib.appendChild(rootCitation)
        var cslinput = oSerializer.serializeToString(rootBib);
        const regexopen = new RegExp(`\&amp;lt;`, 'g');
        cslinput = cslinput.replace(regexopen, `spslessersps`);
        const regexcls = new RegExp(`\\&amp;gt;`, 'g');
        cslinput = cslinput.replace(regexcls, `spsgreaterersps`);
        const regeand = new RegExp(`\\&amp;amp;`, 'g');
        cslinput = cslinput.replace(regeand, `spsandsps`);
           
            resolve(cslinput)
    }catch(e){
        process.send({ counter: { status: 404, msg: e.toString()} });
        process.exit();

    }
       // })();
    })
}


async function ProcessingCSlClient(cslinput,payload,typetospan,dynamicBibTypeCamelCase) {
    console.log('----indhu entry csl client')
    console.log(payload)
    var referenceStyle = payload.referenceStyle;
    if (referenceStyle !== '') {
        if (CSLconfig[referenceStyle] == undefined) {
            CSLconfig[referenceStyle] = "AsInManuscript";
        }
        if (CSLconfig[referenceStyle] == 'AsInManuscript') {
            var cslOptdoc = new dom().parseFromString(cslinput);
            var newCitecslopt = xpath.select("//Bibliography/Citation", cslOptdoc);
            cslwithRefBusCallback(newCitecslopt,dynamicBibTypeCamelCase, typetospan, payload.type, CSLconfig[referenceStyle])

        } else {

            var data = qs.stringify({
                content: cslinput,
                cslstyle: CSLconfig[referenceStyle],
                customer: 'nodi', sort: 'no'
               });
               var config = {
                 method: 'post',
                 url: urlPortConfig.cslclient,
                 headers: { 
                   'Content-Type': 'application/x-www-form-urlencoded'
                 },
                 data : data
               };
               console.log(config)
               
               axios(config)
               .then(function (response) {
                var cslOptdoc = new dom().parseFromString(response.data);
                var newCitecslopt = xpath.select("//Bibliography/Citation", cslOptdoc);

                cslwithRefBusCallback(newCitecslopt,dynamicBibTypeCamelCase, typetospan, payload.type, CSLconfig[referenceStyle])
                 console.log(JSON.stringify(response.data));
               })
               .catch(function (error) {
                   console.log(error)
                process.send({ counter: { status: 404, msg: error.toString()} });
                process.exit();
               });
        }

    } else {
        var cslOptdoc = new dom().parseFromString(cslinput);
        var newCitecslopt = xpath.select("//Bibliography/Citation", cslOptdoc);

        cslwithRefBusCallback(newCitecslopt,dynamicBibTypeCamelCase, typetospan, payload.type, CSLconfig[referenceStyle])
    }
}


async function ForkReference(payload) {
    var opt = payload.data;
	var input = opt.content;
	var method = opt.method;
	//var referenceStyle = opt.referenceStyle;
	var type = opt.type;
    var typetospan = '<span name="CitationNumber" class="EditNotAllowed" title="Label Editing not allowed">' + type + '</span>';





	if (method == 'xmltojson') {
		try {
            await ProcessingXmlToJsonConvertion(input);
			///////////convert json end////////////////////////////
		}
		catch (err) {
            console.log(err)
			process.send({ counter: { status: 400, msg: err.toString() } });
			process.exit();
		}
	}
	else if (method == 'jsontoxml') {
		try {
            
	var dynamicbibtype = "";
    var stringToJson = JSON.parse(opt.content);
    /* Get bibtype keys  */
    var parentBibType = Object.keys(stringToJson.citation);
            staticBibType.map(element => {
                if (parentBibType.includes(element) == true)
                    dynamicbibtype = element;
            })
            var dynamicBibTypeCamelCase = bibTypecamelCase[0][dynamicbibtype];
            console.log(stringToJson)
            console.log(dynamicbibtype)
            console.log(dynamicBibTypeCamelCase)
            let cslinput = await ProcessingJsonToXmlConvertion(stringToJson,opt,typetospan,dynamicbibtype,dynamicBibTypeCamelCase);
            console.log('cslinput',cslinput)
			
            
            await ProcessingCSlClient(cslinput,opt,typetospan,dynamicBibTypeCamelCase)




			
		}
		catch (error) {
			process.send({ counter: { status: 404, msg: error.toString()} });
			process.exit();
		}

	} else if (method == 'bibunstructured') {
		try {
			var type = type;
			responseString = '';
			var contents = input;
			var xmlDoc = new dom().parseFromString(contents);
			var bibunstr = xpath.select('//div[@class="BibUnstructured"]', xmlDoc);
			contents = fun.tagProcess(bibunstr[0].textContent)
			var res = {
				"ref_items":
					[{ "@id": type, "refin": contents }], "noml": "1", "reftype": "1"
			}
			var buff = Buffer.from(JSON.stringify(res)).toString("base64");
			var options =
			{
				host: urlPortConfig.arsServer, port: urlPortConfig.arsServerPort, path: urlPortConfig.arsPath, method: 'POST',
				headers: { 'content-length': Buffer.byteLength(buff), 'content-type': 'application/octet-stream', 'accept': '*/*' }
			};
			req = http.request(options, (res) => {
				console.log(' ----1')
				res.setEncoding('utf8');
				res.on("data", function (data) { responseString += data; });
				res.on("end", () => {
					console.log(' ----2')
					decodedtxt = Buffer.from(responseString, 'base64').toString("utf8");
					var parsedjson = JSON.parse(decodedtxt);
					var refout = parsedjson.ref_items[0].refout;

					console.log(' ----3')
					refout = refout.replace(/<check>/ig, '');
					refout = refout.replace(/<\/check>/ig, '');
					var xmlDoc = new dom().parseFromString(refout);

					if (xpath.select("//Citation/ERROR", xmlDoc).length) {
						console.log(' ----4')
						process.send({ counter: { status: 300, msg: errorOutput } });
						process.exit();
					}
					else {
						console.log(' ----5')
						if (_.get(xmlDoc.documentElement.childNodes, 'length', false)) {
							if (xmlDoc.documentElement.childNodes.length > 3) {
								var parseString = xml2js.parseString;
								parseString(refout,
									{
										explicitArray: true, explicitCharkey: true, trim: true, charkey: '#', emptyTag: { "#": "" },
										attrkey: '@', preserveChildrenOrder: true, mergeAttrs: false, ignoreAttrs: false, charsAsChildren: true,
										explicitRoot: true, tagNameProcessors: [fun.nameToLowerCase]
									}, (err, res) => {
										console.log(' ----6')

										var refBus =
											js2xmlparser.parse('sample', res, { useSelfClosingTagIfEmpty: false, format: { doubleQuotes: true }, declaration: { include: false } });

										refBus = refBus.replace(/<sample>/g, '');
										refBus = refBus.replace(/<\/sample>/g, '');
										console.log(refBus)
										var axios = require('axios');
										var qs = require('qs');
										var data = qs.stringify({
											'method': 'xmltojson',
											'content': refBus,
											'Forkapipath': 'forkreference'
										});
										var config = {
											method: 'post',
											url: urlPortConfig.refRecal,
											headers: {
												'Content-Type': 'application/x-www-form-urlencoded'
											},
											data: data,rejectUnauthorized: false
										};

										axios(config)
											.then(function (response) {
												console.log(JSON.stringify(response.data));
												process.send({ counter: { status: 200, msg: response.data } });
												process.exit();
											})
											.catch(function (error) {
												console.log(error);
												process.send({ counter: { status: 400, msg: JSON.stringify(error) } });
												process.exit();
											});
									})

							} else {
								process.send({ counter: { 'status': 300, 'msg': errorOutput } });
								process.exit();

							}
						}


					}
				});
			});

			req.on('error', (e) => {
				process.send({ counter: { status: 404, msg: "problem with request: " + e } });
				process.exit();
			});
			req.write(buff);
			req.end();
		}
		catch (error) {

			console.error("problem with request: " + error);
			process.send({ counter: { status: 404, msg: "error" } });
			process.exit();
		}
	}
	else {
		process.send({ counter: { status: 400, msg: JSON.stringify({ 'ErrorCode': 'Unsupported request argument' }) } });
		process.exit();
	}

}

// receive message from master process
process.on('message', async (message) => {
	await ForkReference(message);

});
