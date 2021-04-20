

/*START#############################################
#  $Revision: 1.0 $
#
#  Purpose  :Sorting , Abbrivate & JournalTitle reference.
#
#  Author   : Indhumathi R
#
#  Client   : SPS
#
#  Date     : Dec 13, 2019
#
######################################################################END*/

let xpath = require('xpath'), dom = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
var axios = require('axios');
const _ = require('lodash');
/*config.json file for port & other server endpoint details*/
let urlPortConfig = require('../url_port_details.js');

let CSLconfig = require('./csl.json');
var xmlescape = require('xml-escape');
var parseString = require('xml2js').parseString;
var decode = require('unescape');
let Styleconfig = require('./Styleconfig.json');
let journalStyleconfig = require('./journalStylename.json');
let journalNames = require('./journalNames.json');

function ProcessInitialsDotAndSpace(BibAuthorName, authorInstitutional, author, styleWithandwithoutSpace, refStyle) {
	for (const [key, value] of Object.entries(BibAuthorName[author])) {
		if (typeof value[0] === 'object' == false) {
		oldKey = key;
		newKey = value;
		if (oldKey === 'particle') {
			oldKey = 'non-dropping-particle';
		} else if (oldKey === 'initials') {
			oldKey = 'given';

		} else if (oldKey === 'familyname') {
			oldKey = 'family';

		}
		var matchingFullName = newKey[0].match(/([A-Z][a-z]{2,})?(\s*([A-Z][a-z]{2,}))?/g);
		var matchingFullName = matchingFullName.filter(Boolean);
		var matchungNameInitial = newKey[0].match(/([A-Z]([a-z]+)?(\s?[A-Z]([a-z]+))?)/g);
		var hypenated = newKey[0].match(/((?:\w+-)+\w+)/g);

		if ((styleWithandwithoutSpace === 'Initialswithspace') && (oldKey === 'given') && (refStyle !== 'refsort')) {
			//with space in between
			if (oldKey === 'suffix') {
				authorInstitutional[oldKey] = newKey[0] + '.';
			} else {
				if (matchingFullName.length === 0) {
					if (hypenated !== null) {
						var newString = newKey[0].replace(/([A-Z]([a-z]+)?(\s?[A-Z]([a-z]+))?)/g, "$1.");

					} else {
						var newString = newKey[0].replace(/([A-Z]([a-z]+)?(\s?[A-Z]([a-z]+))?)/g, "$1. ");
					}
				} else {
					if (matchungNameInitial.length == 1) {
						var newString = newKey[0];
					} else {
						var newString = newKey[0] + '.';
					}
				}
				var newString = newString.replace(/\s+$/g, "");
				authorInstitutional[oldKey] = newString;
			}


		} else if ((styleWithandwithoutSpace === 'Initialswithoutspace') && (oldKey === 'given') && (refStyle !== 'refsort')) {
			//without space in between
			if (oldKey === 'suffix') {
				authorInstitutional[oldKey] = newKey[0] + '.';
			} else {
				if (matchingFullName.length === 0) {
					var newString = newKey[0].replace(/([A-Z]([a-z]+)?(\s?[A-Z]([a-z]+))?)/g, "$1.");
				} else {
					if (matchungNameInitial.length == 1) {
						var newString = newKey[0];
					} else {
						var newString = newKey[0] + '.';
					}
				}
				authorInstitutional[oldKey] = newString;
			}
            } else {
			authorInstitutional[oldKey] = newKey[0];
		}
	  }
	}
		
	Object.keys(authorInstitutional).forEach(function (key) {
		if (authorInstitutional[key] === '') {
			delete authorInstitutional[key];
		}
	});
	return authorInstitutional;

}

function ProcessBibUnstructured(parser, xmlDoc, body) {
	var withoutstructuredcnt = xpath.select('//div[@class="Citation"]//div[@class="BibUnstructured"]', xmlDoc);

	if (body.bibliographyentry !== undefined) {
		for (let g = 0; g < withoutstructuredcnt.length; g++) {
			var iPCitationID = withoutstructuredcnt[g].parentNode.getAttribute('id');
			body.bibliographyentry.forEach(function (val1, key) {
				if (val1.bib !== undefined) {
					var bibUnstructured = xmlDoc.createElement('div');
					bibUnstructured.setAttribute('class', 'BibUnstructured');
					bib = val1.bib;
					bib = decode(bib.replace(/\&\#38;lt;/g, `<`));
					bib = decode(bib.replace(/\&\#38;gt;/g, `>`));
					if (iPCitationID === val1.citeid) {
						var newUnstructuredtextcnt = xmlDoc.createTextNode(bib);
						bibUnstructured.appendChild(newUnstructuredtextcnt);
						withoutstructuredcnt[g].replaceChild(bibUnstructured, withoutstructuredcnt[g]);
					}
				}

			})
		}
		var oSerializer = new XMLSerializer();
		var cslopt = oSerializer.serializeToString(xmlDoc);
		const regex = new RegExp(`\\&lt;`, 'g');
		cslopt = cslopt.replace(regex, `<`);
		const regex1 = new RegExp(`\\&gt;`, 'g');
		cslopt = cslopt.replace(regex1, `>`);
		const regex2 = new RegExp(`\\&amp;lt;`, 'g');
		cslopt = cslopt.replace(regex2, `<`);
		const regex3 = new RegExp(`\\&amp;gt;`, 'g');
		cslopt = cslopt.replace(regex3, `>`);
		cslopt = cslopt.replace(/\s{2,}/g, ' ');
		ProcessCustomerTag(cslopt, parser)
	} else {
		process.send({ counter: { status: 400, msg: 'Invalid input xml' } });
		process.exit();

	}
}

function ProcessCustomerTag(cslopt, parser) {
	var doc = parser.parseFromString(cslopt, 'text/xml');
	var AllBibUnStructure = xpath.select('//div[@class="Citation"]//div[@class="BibUnstructured"]', doc)
	for (let g = 0; g < AllBibUnStructure.length; g++) {
		for (let h = 0; h < AllBibUnStructure[g].childNodes.length; h++) {
			const { nodeName, textContent } = AllBibUnStructure[g].childNodes[h];
			if (nodeName !== '#text') {
				if (nodeName == 'a') {
					var newRefTarget = doc.createElement('span');
					newRefTarget.setAttribute('class', 'ExternalRef');
					var spanRefTarget = doc.createElement('span');
					spanRefTarget.setAttribute('class', 'RefSource');
					var Spandoi = doc.createTextNode(AllBibUnStructure[g].childNodes[h].getAttribute('href'));
					var Comretarget = doc.createElement('RefTarget');
					Comretarget.setAttribute('TargetType', 'DOI');
					Comretarget.setAttribute('Address', textContent);
					var Spandoicommand = doc.createComment(Comretarget);
					spanRefTarget.appendChild(Spandoi);
					newRefTarget.appendChild(spanRefTarget);
					newRefTarget.appendChild(Spandoicommand);
					doc.replaceChild(newRefTarget, AllBibUnStructure[g].childNodes[h]);

				} else if (nodeName === 'Emphasis') {
					var empTypeattr = AllBibUnStructure[g].childNodes[h].getAttribute('Type');
					if (empTypeattr === 'Bold') {
						var newEmphasis = doc.createElement('b');
					} else {

						var newEmphasis = doc.createElement('i');
					}
					var newEmphasisnodevalue = doc.createTextNode(textContent);
					newEmphasis.appendChild(newEmphasisnodevalue);
					doc.replaceChild(newEmphasis, AllBibUnStructure[g].childNodes[h]);

				}
			}
		}

	}
	var oSerializer = new XMLSerializer();
	var docoutput = oSerializer.serializeToString(doc);
	// send response to master process
	process.send({ counter: { status: 200, msg: docoutput } });
	process.exit();
	//return docoutput;
}

function ProcessSorting(body, xmlDocinput, newBibliographydiv) {
	if (body.bibliographyentry !== undefined) {
		body.bibliographyentry.forEach(function (val1, key) {
			var sortingvalue = xpath.select('//div[@id="' + val1.citeid + '"]', xmlDocinput);
			if (sortingvalue) {
				newBibliographydiv.appendChild(sortingvalue[0]);
			}
		})
		var withoutstructuredcnt = xpath.select('//div[@class="Citation"]', xmlDocinput);
		if (withoutstructuredcnt.length > 0) {
			for (let g = 0; g < withoutstructuredcnt.length; g++) {
				newBibliographydiv.appendChild(withoutstructuredcnt[g]);
			}
		}
		var oSerializer = new XMLSerializer();
		var cslopt = oSerializer.serializeToString(newBibliographydiv);
		const regex = new RegExp(`\&lt;`, 'g');
		cslopt = cslopt.replace(regex, `<`);
		process.send({ counter: { status: 200, msg: cslopt } });
		process.exit();

	} else {
		process.send({ counter: { status: 400, msg: 'Invalid input xml' } });
		process.exit();

	}


}

function ProcessInitialsDotAndSpaceforjourlTitle(abbrivateJourlTitle, styleWithandwithoutSpace) {
	if (styleWithandwithoutSpace === 'WithoutDotChanges') {
		/* with space in between  */
		var newString = abbrivateJourlTitle.replace(/\./g, "\ ");
		changeJourlTitle = newString;

	} else if (styleWithandwithoutSpace == 'WithChanges') {

		changeJourlTitle = abbrivateJourlTitle;
	}
	return changeJourlTitle;

}


async function sendMultipleXml(message) {
	console.log('ttttttttttt',message.data.referenceStyle)
	var xml = message.data.content;
	var referenceStyle = message.data.referenceStyle;
	var refStyle = message.data.refStyle;

	if (CSLconfig[referenceStyle] === undefined || CSLconfig[referenceStyle] == 'AsInManuscript') {
		var CslStylename = 'springer-basic-author-date-withsort';
	} else {
		var CslStylename = CSLconfig[referenceStyle];
	}
	var camelCaseBibType = {
		'volumeid': 'volume',
		'issueid': 'issue',
		'numberinseries': 'collection-number',
		'publisherlocation': 'publisher-place',
		'publishername': 'publisher',
		'bibarticledoi': 'DOI',
		'bibchapterdoi': 'DOI',
		'bibbookdoi': 'DOI',
		'editionnumber': 'edition',
		'bibcomments': 'BibComments',
		'ISBN': 'ISBN',
		'seriestitle': 'SeriesTitle',
		'eds': 'eds'
	}

	if (refStyle === 'journalTitleAbbreviate') {
		var commanconfig = journalStyleconfig;
	} else {
		var commanconfig = Styleconfig;
	}

	var styleWithandwithoutSpace = '';
	Object.entries(commanconfig).map(([oldKey, newKey]) => {
		if (oldKey === CslStylename) {
			styleWithandwithoutSpace = newKey;
		}
	})
	try {
		/*String xml input convert to parserstring using dom parser */
		var DOMParser = require('xmldom').DOMParser;
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xml, 'text/xml');
		var xmlDocinput = parser.parseFromString(xml, 'text/xml');

		var authorInstitutional = { 'Prefix': '', 'initials': '', 'familyname': '', 'particle': '', 'Suffix': '' }
        var Authorjsonlist = [];
        var Editorjsonlist = [];

		if (refStyle === 'refsort') {
			var AllCitation = xpath.select('//div[@class="Citation"]//div[@class="BibStructured"]|//div[@class="PartiallyStructured"]', xmlDoc);
		} else {
			var AllCitation = xpath.select('//div[@class="Citation"]//div[@class="BibStructured"]', xmlDoc);
		}
		for (let x = 0; x < AllCitation.length; x++) {
			for (let h = 0; h < AllCitation[x].childNodes.length; h++) {
				const { nodeName } = AllCitation[x].childNodes[h];
				if (nodeName !== '#text') {
					for (let z = 0; z < AllCitation[x].childNodes[h].childNodes.length; z++) {
						const { nodeName, childNodes, textContent, attributes } = AllCitation[x].childNodes[h].childNodes[z];
						if (nodeName !== '#text') {
							if (_.includes(nodeName, 'title') || _.includes(nodeName, 'Title')) {
								if (refStyle === 'journalTitleAbbreviate' && (AllCitation[x].childNodes[0].nodeName === 'bibarticle') && (nodeName === 'journaltitle') && (journalNames[textContent] !== undefined && 'WithoutChanges' !== styleWithandwithoutSpace)) {
									ProcessInitialsDotAndSpaceforjourlTitle(journalNames[textContent], styleWithandwithoutSpace)
									content = '<journaltitle>' + changeJourlTitle + '</journaltitle>';
								} else {
									content = (AllCitation[x].childNodes[h].childNodes[z]).toString();
								}
								content = content.replace(/\<(journaltitle|articletitle|chaptertitle|booktitle|seriestitle)[^>]*\>/g, "");
								content = content.replace(/\<\/(journaltitle|articletitle|chaptertitle|booktitle|seriestitle)\>/g, "");
								content = xmlescape(content);
								var textNode = xmlDoc.createTextNode(content);
								var newartciletitle = xmlDoc.createElement(nodeName);
								if (attributes.length) {
									newartciletitle.setAttribute(attributes[0].nodeName, attributes[0].nodeValue);
								}
								newartciletitle.appendChild(textNode);
								xmlDoc.replaceChild(newartciletitle, AllCitation[x].childNodes[h].childNodes[z]);

							}
							if (refStyle == 'refabbrivate') {
								if (nodeName === 'bibauthorname' || nodeName === 'bibeditorname') {
									newBibTypeChild = xmlDoc.createElement(nodeName)
									for (let s = 0; s < childNodes.length; s++) {
										const { nodeName, textContent } = childNodes[s];
										if (nodeName !== '#text') {
											if (nodeName === 'initials') {
												var newString = textContent.replace(/\b(([A-Z])[a-z]{2,})+\b/g, "$2");
												var abbrivate = newString.replace(/\b([A-Z]) \b/g, "$1");
												newBibTypeSubChildtext = xmlDoc.createTextNode(abbrivate)
                                            } else {
												newBibTypeSubChildtext = xmlDoc.createTextNode(textContent)
											}
											newBibTypeSubChild = xmlDoc.createElement(nodeName)
											newBibTypeSubChild.appendChild(newBibTypeSubChildtext)
											newBibTypeChild.appendChild(newBibTypeSubChild)
										}
									}
									AllCitation[x].childNodes[h].replaceChild(newBibTypeChild, AllCitation[x].childNodes[h].childNodes[z])
								}
							}

						}
					}
				}
			}
		}
		var item = [];
		if (refStyle === 'refsort') {
			AllCitation = xpath.select('//div[@class="Citation"]//div[@class="BibStructured"]|//div[@class="PartiallyStructured"]', xmlDoc)
		} else {
			var AllCitation = xpath.select('//div[@class="Citation"]//div[@class="BibStructured"]', xmlDoc);
		}

		for (let z = 0; z < AllCitation.length; z++) {
			var id = AllCitation[z].parentNode.getAttribute('id');
			Authorjsonlist = [], Editorjsonlist = [];
			for (let w = 0; w < AllCitation[z].childNodes.length; w++) {
				const { nodeName } = AllCitation[z].childNodes[w];
				if (nodeName !== '#text') {
                    parseString(AllCitation[z].childNodes[w], {}, function(err, bibauthoropt1) {
						for (k = 0; k < AllCitation[z].childNodes[w].childNodes.length; k++) {
							const { nodeName, textContent } = AllCitation[z].childNodes[w].childNodes[k]
							if (nodeName !== '#text') {
								var bibChild = bibauthoropt1[AllCitation[z].childNodes[w].nodeName];
								bibChild.id = id;
								if ('bibauthorname' == nodeName || 'institutionalauthorname' == nodeName) {
									if ('bibauthorname' === nodeName) {
                                        parseString(AllCitation[z].childNodes[w].childNodes[k], {}, function(err, bibauthoropt) {
											ProcessInitialsDotAndSpace(bibauthoropt, authorInstitutional, nodeName, styleWithandwithoutSpace, refStyle)
											Authorjsonlist.push(authorInstitutional)
											authorInstitutional = { 'Prefix': '', 'initials': '', 'familyname': '', 'particle': '', 'Suffix': '' }

										})

									} else {
										Authorjsonlist.push({ 'literal': textContent })
									}


								} else if ('bibeditorname' === nodeName || 'bibinstitutionaleditorname' === nodeName) {
									if ('bibeditorname' === nodeName) {
                                        parseString(AllCitation[z].childNodes[w].childNodes[k], {}, function(err, bibeditoropt) {
											ProcessInitialsDotAndSpace(bibeditoropt, authorInstitutional, nodeName, styleWithandwithoutSpace, refStyle)
											Editorjsonlist.push(authorInstitutional)

											authorInstitutional = { 'Prefix': '', 'initials': '', 'familyname': '', 'particle': '', 'Suffix': '' }

										})

									} else {
										Editorjsonlist.push({ 'literal': textContent });
									}
								} else {
									if (nodeName === 'year') {
										bibChild.issued = { 'raw': bibChild[nodeName][0] }
									} else if (nodeName === 'firstpage' || nodeName === 'lastpage') {
										if (bibChild.lastpage !== undefined && bibChild.firstpage !== undefined)
											bibChild.page = bibChild.firstpage[0] + "-" + bibChild.lastpage[0]
										else if (bibChild.lastpage === undefined && bibChild.firstpage !== undefined)
											bibChild.page = bibChild.firstpage[0]
										else if (bibChild.firstpage === undefined && bibChild.lastpage !== undefined) {
											bibChild.page = bibChild.lastpage[0]
										}
									} else if (_.includes(nodeName, 'title') && (!_.includes(nodeName, 'seriestitle'))) {
										if (AllCitation[z].childNodes[w].nodeName === 'bibchapter' && nodeName === 'booktitle' || AllCitation[z].childNodes[w].nodeName === 'bibarticle' && nodeName === 'journaltitle') {
											bibChild['container-title'] = bibChild[nodeName][0];
                                        } else if (!_.includes(nodeName, 'nochaptertitle') && !_.includes(nodeName, 'noarticletitle')) {
											if (bibChild[nodeName][0]['_'] !== undefined)
												bibChild['title'] = bibChild[nodeName][0]['_'];
											else
												bibChild['title'] = bibChild[nodeName][0];
										} else {
											bibChild['title'] = bibChild[nodeName][0];
										}


									} else if (nodeName === 'etal') {
										if ((AllCitation[z].childNodes[w].childNodes[k - 1].nodeName === '#text') && ('bibeditorname' === AllCitation[z].childNodes[w].childNodes[k - 2].nodeName || 'bibinstitutionaleditorname' === AllCitation[z].childNodes[w].childNodes[k - 2].nodeName || 'eds' === AllCitation[z].childNodes[w].childNodes[k - 2].nodeName)) {
											bibChild['eetal'] = 'true'
										} else if ((AllCitation[z].childNodes[w].childNodes[k - 1].nodeName !== '#text') && ('bibeditorname' === AllCitation[z].childNodes[w].childNodes[k - 1].nodeName || 'bibinstitutionaleditorname' === AllCitation[z].childNodes[w].childNodes[k - 1].nodeName || 'eds' === AllCitation[z].childNodes[w].childNodes[k - 1].nodeName))
											bibChild['eetal'] = 'true'
										else
											bibChild['etal'] = 'true'
										if (bibChild['etal'].length === 1)
											bibChild = _.omit(bibChild, 'etal');
									} else {
										bibChild[camelCaseBibType[nodeName]] = bibChild[nodeName][0]
									}
								}
							}

						}
						 bibsubchild = bibChild;
						if ((AllCitation[z].childNodes[w].nodeName.substring(3)).toLowerCase() === 'article') {
							bibsubchild['type'] = "article-journal";
                        } else {
							bibsubchild['type'] = (AllCitation[z].childNodes[w].nodeName.substring(3)).toLowerCase();
						}
						if (Authorjsonlist.length > 0)
						bibsubchild.author = Authorjsonlist
						if (Editorjsonlist.length > 0) {
							bibsubchild.editor = Editorjsonlist
						}
						bibsubchild = _.omit(bibsubchild, 'bibauthorname', 'journaltitle', 'year', 'bibeditorname', 'articletitle', 'noarticletitle', 'nochaptertitle', 'institutionalauthorname', 'bibinstitutionaleditorname', 'firstpage', 'lastpage', 'booktitle', 'chaptertitle', 'bibbookdoi', 'bibchapterdoi', ' bibarticledoi');
						if (bibsubchild !== '')
							item.push(bibsubchild)

					})
				}
			}
        }
        if (item.length != 0) {
			var data = JSON.stringify({ "items": item });

			var config = {
				method: 'post',
				url: urlPortConfig.cslserver + '' + CslStylename,
				headers: {
					'Content-Type': 'application/json'
				},
				data: data
			};

			axios(config)
				.then(function (response) {
					if (response.data !== undefined) {
						if ('Could not parse POSTed data' === response.data) {
							process.send({ counter: { status: 404, msg: 'Input content is having invaild PartiallyStructured' } });
							process.exit();
						} else {
							var newBibliographydiv = xmlDocinput.createElement('div');
							newBibliographydiv.setAttribute('id', 'Bib1');
							newBibliographydiv.setAttribute('priority', '10');
							newBibliographydiv.setAttribute('view', 'unstructured');
							newBibliographydiv.setAttribute('class', 'Bibliography');
							let headingdiv = xmlDocinput.createElement('div')
							headingdiv.setAttribute('class', 'Heading');
							var headingtextnodes = xmlDocinput.createTextNode('References');
							/* To create heading tag  */
							headingdiv.appendChild(headingtextnodes)
							/* Append bibliograpy div tag to heading tag    */
							newBibliographydiv.appendChild(headingdiv)
							if (refStyle === 'refsort') {
								ProcessSorting(response.data, xmlDocinput, newBibliographydiv);
							} else {
								ProcessBibUnstructured(parser, xmlDoc, response.data);
							}
						}

					} else {

						process.send({ counter: { status: 404, msg: "Invalid Input" } });
						process.exit();
					}
				})
				.catch(function (error) {
					process.send({ counter: { status: 404, msg: error.toString() } });
					process.exit();
				});

            // var options = {
			// 	url: urlPortConfig.cslserver + '' + CslStylename,
            //     method: 'POST',
            //     headers: { 'content-type': 'application/json', 'accept': '*/*' },
            //     body: { "items": item },
            //     json: true
			// };
			// rp(options, function (error, clires, body) {
			// 	if (body !== undefined) {
			// 		if ('Could not parse POSTed data' === body) {
			// 			process.send({ counter: { status: 404, msg: 'Input content is having invaild PartiallyStructured' } });
			// 			process.exit();
			// 		} else {
			// 		var newBibliographydiv = xmlDocinput.createElement('div');
			// 		newBibliographydiv.setAttribute('id', 'Bib1');
			// 		newBibliographydiv.setAttribute('priority', '10');
			// 		newBibliographydiv.setAttribute('class', 'Bibliography');
			// 		let headingdiv = xmlDocinput.createElement('div')
			// 		headingdiv.setAttribute('class', 'Heading');
			// 		var headingtextnodes = xmlDocinput.createTextNode('References');
			// 		/* To create heading tag  */
			// 		headingdiv.appendChild(headingtextnodes)
			// 		/* Append bibliograpy div tag to heading tag    */
			// 		newBibliographydiv.appendChild(headingdiv)
			// 		if (refStyle === 'refsort') {
			// 			ProcessSorting(body, xmlDocinput, newBibliographydiv);
            //             } else {
			// 			ProcessBibUnstructured(parser, xmlDoc, body);
			// 		}
			// 		}

			// 	}  else {

			// 		process.send({ counter: { status: 404, msg: "Invalid Input" } });
			// 		process.exit();
			// 	}
			// })
        } else {

			process.send({ counter: { status: 404, msg: "Unclosed xml attribute" } });
			process.exit();

		}

    } catch (error) {
		console.log(error)

        process.send({ counter: { status: 404, msg: error.toString() } });
        process.exit();
	}
}

// receive message from master process
process.on('message', async (message) => {
	 await sendMultipleXml(message);

});