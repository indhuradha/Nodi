
/*START#############################################
#
#  Purpose  : Fork method for job sheet.
#
#  Author   : Indhumathi R
#
#  Client   : SPS
#
#  Date     : April 29, 2020
#
*/
/*npm http for connecting with another endpoint*/
var date = new Date();
var year = date.getFullYear();
/*config.json file for port & other server endpoint details*/
let url_port_details = require('../url_port_details');
let glob = require('glob');
let fs = require('fs');

/* npm xpath ,npm xmldom to load and traverse through the xml */
let xpath = require('xpath'), dom = require('xmldom').DOMParser;
let xml2js = require('xml2js');


async function ForkJobSheet(message) {
    var endUser = message.endUser;
    var type = message.type;
    var jour_no = message.jour_no;
    var art_no = message.art_no;
    var book_no = message.book_no;
    var chapter_no = message.chapter_no;
    var jobsheettype = "";
    if (type == 'act' || type == "bk-act") {
        jobsheettype = "_JobSheet_300.xml";
    } else if (type == 'ce' || type == "bk-ce") {
        jobsheettype = "_JobSheet_200.xml";
    }
    if (type == "ce" || type == "act") {
        var oldfilepath = url_port_details.filepath + url_port_details[type] + jour_no + "/" + art_no;
        if (!fs.existsSync(oldfilepath)) {
            oldfilepath = url_port_details.filepath + jour_no + "/" + art_no;
        }
        var filePath = oldfilepath + "/" + jour_no + "_*_" + art_no + jobsheettype;
    } else if (type == "bk-ce" || type == "bk-act") {
        var filePath = url_port_details.filepath + url_port_details[type] + book_no + "/" + chapter_no + "/" + book_no + "_" + chapter_no + jobsheettype;
        }
        glob(filePath, {}, (err, files) => {
            if (err || files.length == 0) {
                process.send({ counter: { status: 400, msg: 'Job sheet file not found.' } });
                process.exit();
            }
            else {
                try {
                    fs.readFile(files[0], { encoding: 'utf-8' }, function (err, content) {
                        var infoOpt = []; var jsonjobsheetopt = "";
                        var DOMParser = require('xmldom').DOMParser;
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(content, 'text/xml');
                        var jsonjobsheet = [];
                        if ((jour_no === '' || jour_no === undefined) && (art_no === '' || art_no === undefined)) {
                            var staticInfo = ['ChapterInfo', 'AuthorGroup', 'TechnicalInfo', 'FullServiceVendor'];
                            var JnlsArray = [
                                {
                                    'ChapterInfo': xpath.select('//BookJobSheet/ChapterInfo/ChapterID|//ChapterDOI|//ChapterHistory|//ChapterTitle|//ChapterJobSheet/ChapterInfo/ChapterID|//ChapterDOI|//ChapterHistory|//ChapterTitle|//PartJobSheet/BookInfo/BookID|//BookDOI|//PartJobSheet/BookInfo/BookTitle', xmlDoc),
                                    'TechnicalInfo': xpath.select('//BookJobSheet/ProductionInfo/TechnicalInfo/BibliographyStyle|//ChapterJobSheet/ProductionInfo/TechnicalInfo/BibliographyStyle|//PartJobSheet/ProductionInfo/TechnicalInfo/BibliographyStyle', xmlDoc),
                                    'AuthorGroup': xpath.select('//BookJobSheet/AuthorGroup/Author|//ChapterJobSheet/AuthorGroup/Author| //PartJobSheet/PartInfoGroup/PartInfo', xmlDoc),
                                    'FullServiceVendor': xpath.select('//BookJobSheet/ProductionInfo/WorkflowInfo/Supplier/FullServiceVendor/RemarkTo|//ChapterJobSheet/ProductionInfo/WorkflowInfo/Supplier/FullServiceVendor/RemarkTo|//PartJobSheet/ProductionInfo/WorkflowInfo/Supplier/FullServiceVendor/RemarkTo', xmlDoc)
                                }
                            ]
                        } else {
                            var staticInfo = ['ArticleInfo', 'AuthorGroup', 'TechnicalInfo', 'FullServiceVendor'];
                            var JnlsArray = [
                                {
                                    'ArticleInfo': xpath.select('//ArticleJobSheet/ArticleInfo/ArticleID|//ArticleDOI|//ArticleHistory|//ArticleTitle', xmlDoc),
                                    'TechnicalInfo': xpath.select('//ArticleJobSheet/ProductionInfo/TechnicalInfo/TitleUpperCase|//AuthorInformationStyle|//HistoryStyle|//AbstractInDocumentLanguage|//StructuredAbstract|//KeywordsInDocumentLanguage|//BibliographyStyle|//CitationStyle|//Typesetting|//TextSpecifications|//ColorSpecifications/LayoutColorName|//FormatTrimSize|//ReferencePDFStyle|//FixedArticleStructure', xmlDoc),
                                    'AuthorGroup': xpath.select('//ArticleJobSheet/AuthorGroup/Author', xmlDoc),
                                    'FullServiceVendor': xpath.select('//ArticleJobSheet/ProductionInfo/WorkflowInfo/Supplier/FullServiceVendor/RemarkTo', xmlDoc)
                                }
                            ]

                        }

                        for (let v = 0; v < staticInfo.length; v++) {
                            jsonjobsheet = [];
                            ArticleInfo = JnlsArray[0][staticInfo[v]];
                            for (let g = 0; g < ArticleInfo.length; g++) {
                                const { nodeName, textContent, childNodes, attributes } = ArticleInfo[g];
                                var arrayarticlehistory = [];
                                if (childNodes.length == 1) {
                                    if (textContent == "") {
                                        for (let d = 0; d < attributes.length; d++) {
                                            const { nodeName, textContent } = attributes[d];
                                            arrayarticlehistory.push({ [nodeName]: textContent })

                                        }

                                    } else {
                                        jsonjobsheet.push({
                                            [nodeName]: textContent
                                        })
                                    }
                                }
                                else {

                                    var authordetails = ''
                                    for (let l = 0; l < childNodes.length; l++) {
                                        const { nodeName } = childNodes[l];
                                        if (nodeName !== "#text") {
                                            var monthdetails = "";
                                            for (let h = 0; h < childNodes[l].childNodes.length; h++) {
                                                const { nodeName, textContent } = childNodes[l].childNodes[h];
                                                if (nodeName !== "#text") {
                                                    if ('Day' === nodeName)
                                                        monthdetails += textContent;
                                                    else
                                                        monthdetails += textContent + '-';
                                                }
                                            }
                                            if ('ArticleHistory' === ArticleInfo[g].nodeName || 'ChapterHistory' === ArticleInfo[g].nodeName)
                                                jsonjobsheet.push({ [nodeName]: monthdetails })
                                            else if ('Author' === ArticleInfo[g].nodeName) {
                                                authordetails += monthdetails + ' ';
                                            }

                                        }
                                    }
                                    if (textContent == "") {
                                        for (let d = 0; d < attributes.length; d++) {
                                            if (attributes.length > 1) {
                                                jsonjobsheet.push({
                                                    [attributes[d].nodeName]: attributes[d].textContent
                                                })

                                            } else {
                                                jsonjobsheet.push({
                                                    [nodeName]: attributes[d].textContent
                                                })
                                            }
                                        }

                                    } else {
                                        if ('ArticleHistory' !== nodeName && 'ChapterHistory' !== nodeName) {
                                            if (staticInfo[0] == 'ChapterInfo') {
                                                jsonjobsheet.push({ [nodeName]: authordetails + '' + xpath.select('//BookJobSheet/AuthorGroup/Author|//ChapterJobSheet/AuthorGroup/Author', xmlDoc)[0].getAttribute('ORCID') });
                                            } else {
                                                jsonjobsheet.push({ [nodeName]: authordetails + '' + xpath.select('//ArticleJobSheet/AuthorGroup/Author', xmlDoc)[0].getAttribute('ORCID') });
                                            }
                                        }
                                    }
                                }
                            }
                            try {
                            if (staticInfo[v] === 'ArticleInfo') {
                                jsonjobsheet.push({
                                    'ArticleType': xpath.select('//ArticleJobSheet/ArticleInfo', xmlDoc)[0].getAttribute('ArticleType'),
                                })
                                jsonjobsheet.push({
                                    'ContainsColorImages': xpath.select('//ArticleJobSheet/ProductionInfo/DiscreteObjectTechnicalInfo', xmlDoc)[0].getAttribute('ContainsColorImages'),
                                })
                                jsonjobsheet.push({
                                    'ColorInPrint': xpath.select('//ArticleJobSheet/ProductionInfo/DiscreteObjectTechnicalInfo', xmlDoc)[0].getAttribute('ColorInPrint'),
                                })
                            } else if (staticInfo[v] === 'ChapterInfo') {
                                jsonjobsheet.push({
                                        'ChapterType': xpath.select('//DiscreteBookObjectInfo[@ID="Chapter_' + chapter_no + '"]/ChapterInfo|//DiscreteBookObjectInfo[@ID="PartFrontmatter_' + chapter_no + '"]/BookFrontmatterInfo|//ChapterJobSheet/ChapterInfo', xmlDoc)[0].getAttribute('ChapterType'),
                                })
                                jsonjobsheet.push({
                                        'ContainsColorImages': xpath.select('//DiscreteBookObjectInfo[@ID="Chapter_' + chapter_no + '"]/DiscreteObjectTechnicalInfo|//DiscreteBookObjectInfo[@ID="PartFrontmatter_' + chapter_no + '"]/DiscreteObjectTechnicalInfo|//ChapterJobSheet/ProductionInfo/DiscreteObjectTechnicalInfo', xmlDoc)[0].getAttribute('ContainsColorImages'),
                                })
                                jsonjobsheet.push({
                                        'ColorInPrint': xpath.select('//DiscreteBookObjectInfo[@ID="Chapter_' + chapter_no + '"]/DiscreteObjectTechnicalInfo|//DiscreteBookObjectInfo[@ID="PartFrontmatter_' + chapter_no + '"]/DiscreteObjectTechnicalInfo|//ChapterJobSheet/ProductionInfo/DiscreteObjectTechnicalInfo', xmlDoc)[0].getAttribute('ColorInPrint'),
                                })

                            }

                            } catch (err) {

                                process.send({ counter: { status: 400, msg: 'job sheet tag name is invalid' } });
                                process.exit();
                            }

                            infoOpt.push({
                                [staticInfo[v]]: jsonjobsheet

                            })

                        }
                        if (endUser === 'api') {
                            var refstylename = '';
                            for (let h = 0; h < infoOpt[2].TechnicalInfo.length; h++) {
                                var refstylename = infoOpt[2].TechnicalInfo[h].BibliographyStyle;
                                if (refstylename !== undefined) {
                                    var refstylename = infoOpt[2].TechnicalInfo[h].BibliographyStyle;
                                    break;
                                }
                            }
                            jsonjobsheetopt = { 'BibliographyStyle': refstylename };
                        } else {
                            jsonjobsheetopt = infoOpt;
                        }
                        process.send({ counter: { status: 200, msg: jsonjobsheetopt } });
                        process.exit();
                    })
                }
                /*If html files is not present in the filepath*/
                catch (err) {
                    process.send({ counter: { status: 400, msg: 'Job sheet file not found.' } });
                    process.exit();
                }
            }
        })
}

// receive message from master process
process.on('message', async (message) => {
    await ForkJobSheet(message);

});
