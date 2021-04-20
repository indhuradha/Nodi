#!//d:/restapi/router/url_port_details.js

/*START#############################################
#
#  Purpose  : url,port details of other server which is configured in NODI 
#
#  Author   : Ranjitha
#
#  Client   : SPS
#
#  Date     : January 06, 2020
#
*/

/*To get the value of environment*/
let ecoconfig = require('./../ecosystem.config.js');


var node_env, filepath, port, html2xmlServerurl, contentcheckerserverurl, imagePath, imageServerPath, arsServer, arsServerPort, arsPath,
    refmlServer, refmlServerPort, refmlPath, refRecal, spellServer, cslserver, cslclient, serveImageNotfoundfile, uploadfilepath,
    xml2htmlServer, logPath, kibanaServer, hostName, processAffliation, trackChange, xml2htmlServerCorr, nodiindesignServer,
    copyXMLServer, html2xmlCorrServer, pageExpressServer, nodiSupportingServer, forkPath, xml2htmlServerBooks, html2xmlServerBooks, checkTexServer,
    jnls_ce, jnls_act, books_ce, books_act, xml2htmlServerBooksCorr, html2xmlServerBooksCorr, chennai, trichy, updateDB_url, esmList_url,
    esmRename_url, dbPath, book_ce_pgx, book_act_pgx, ce_pgx, act_pgx;


if (process.env.node_env == 'development') {
    node_env = process.env.node_env;
    filepath = ecoconfig.apps[0].env_development.filePath;
    forkPath = ecoconfig.apps[0].env_development.forkPath;
    port = ecoconfig.apps[0].env_development.port;
    html2xmlServerurl = ecoconfig.apps[0].env_development.html2xmlServer;
    contentcheckerserverurl = ecoconfig.apps[0].env_development.content_checker_server;
    imagePath = ecoconfig.apps[0].env_development.imagePath;
    imageServerPath = ecoconfig.apps[0].env_development.imageServerPath;
    arsServer = ecoconfig.apps[0].env_development.arsServer;
    arsServerPort = ecoconfig.apps[0].env_development.arsServerPort;
    arsPath = ecoconfig.apps[0].env_development.arsPath;
    refmlServer = ecoconfig.apps[0].env_development.refmlServer;
    refmlServerPort = ecoconfig.apps[0].env_development.refmlServerPort;
    refmlPath = ecoconfig.apps[0].env_development.refmlPath;
    refRecal = ecoconfig.apps[0].env_development.refRecal;
    spellServer = ecoconfig.apps[0].env_development.spellServer;
    cslserver = ecoconfig.apps[0].env_development.cslserver;
    cslclient = ecoconfig.apps[0].env_development.cslclient;
    serveImageNotfoundfile = ecoconfig.apps[0].env_development.serveImageNotfoundfile;
    uploadfilepath = ecoconfig.apps[0].env_development.uploadfilepath;
    xml2htmlServer = ecoconfig.apps[0].env_development.xml2htmlServer;
    logPath = ecoconfig.apps[0].env_development.logPath;
    kibanaServer = ecoconfig.apps[0].env_development.kibanaServer;
    hostName = ecoconfig.apps[0].env_development.hostName;
    processAffliation = ecoconfig.apps[0].env_development.processAffiliationServer;
    trackChange = ecoconfig.apps[0].env_development.trackChange;
    xml2htmlServerCorr = ecoconfig.apps[0].env_development.xml2htmlServerCorr;
    nodiindesignServer = ecoconfig.apps[0].env_development.nodiindesignServer;
    copyXMLServer = ecoconfig.apps[0].env_development.copyXMLServer;
	html2xmlCorrServer = ecoconfig.apps[0].env_development.html2xmlCorrServer;
    pageExpressServer = ecoconfig.apps[0].env_development.pageExpressServer;
    nodiSupportingServer = ecoconfig.apps[0].env_development.nodiSupportingServer;
 xml2htmlServerBooks = ecoconfig.apps[0].env_development.xml2htmlServerBooks;
    html2xmlServerBooks = ecoconfig.apps[0].env_development.html2xmlServerBooks;
     checkTexServer = ecoconfig.apps[0].env_development.checkTexServer;
     jnls_ce = ecoconfig.apps[0].env_development['ce'];
     jnls_act = ecoconfig.apps[0].env_development['act'];
     books_ce = ecoconfig.apps[0].env_development['bk-ce'];
     books_act = ecoconfig.apps[0].env_development['bk-act'];
    book_ce_pgx = ecoconfig.apps[0].env_development['bk-ce-pgx'];
    book_act_pgx = ecoconfig.apps[0].env_development['bk-act-pgx'];
    ce_pgx = ecoconfig.apps[0].env_development['ce-pgx'];
    act_pgx = ecoconfig.apps[0].env_development['act-pgx'];
    xml2htmlServerBooksCorr = ecoconfig.apps[0].env_development.xml2htmlServerBooksCorr;
    html2xmlServerBooksCorr = ecoconfig.apps[0].env_development.html2xmlServerBooksCorr;
    chennai = ecoconfig.apps[0].env_development.chennai;
    trichy = ecoconfig.apps[0].env_development.trichy;
    updateDB_url = ecoconfig.apps[0].env_development.updateDB_url;
    esmList_url = ecoconfig.apps[0].env_development.esmList_url;
    esmRename_url = ecoconfig.apps[0].env_development.esmRename_url;
     dbPath = ecoconfig.apps[0].env_development.dbPath;
     
} else {
    node_env = process.env.node_env;
    filepath = ecoconfig.apps[0].env_production.filePath;
    forkPath = ecoconfig.apps[0].env_production.forkPath;
    port = ecoconfig.apps[0].env_production.port;
    html2xmlServerurl = ecoconfig.apps[0].env_production.html2xmlServer;
    contentcheckerserverurl = ecoconfig.apps[0].env_production.content_checker_server;
    imagePath = ecoconfig.apps[0].env_production.imagePath;
    imageServerPath = ecoconfig.apps[0].env_production.imageServerPath;
    arsServer = ecoconfig.apps[0].env_production.arsServer;
    arsServerPort = ecoconfig.apps[0].env_production.arsServerPort;
    arsPath = ecoconfig.apps[0].env_production.arsPath;
    refmlServer = ecoconfig.apps[0].env_production.refmlServer;
    refmlServerPort = ecoconfig.apps[0].env_production.refmlServerPort;
    refmlPath = ecoconfig.apps[0].env_production.refmlPath;
    refRecal = ecoconfig.apps[0].env_production.refRecal;
    spellServer = ecoconfig.apps[0].env_production.spellServer;
    cslserver = ecoconfig.apps[0].env_production.cslserver;
    cslclient = ecoconfig.apps[0].env_production.cslclient;
    serveImageNotfoundfile = ecoconfig.apps[0].env_production.serveImageNotfoundfile;
    uploadfilepath = ecoconfig.apps[0].env_production.uploadfilepath;
    xml2htmlServer = ecoconfig.apps[0].env_production.xml2htmlServer;
    logPath = ecoconfig.apps[0].env_production.logPath;
    kibanaServer = ecoconfig.apps[0].env_production.kibanaServer;
    hostName = ecoconfig.apps[0].env_production.hostName;
    processAffliation = ecoconfig.apps[0].env_production.processAffiliationServer;
    trackChange = ecoconfig.apps[0].env_production.trackChange;
    xml2htmlServerCorr = ecoconfig.apps[0].env_production.xml2htmlServerCorr;
    nodiindesignServer = ecoconfig.apps[0].env_production.nodiindesignServer;
    copyXMLServer = ecoconfig.apps[0].env_production.copyXMLServer;
	html2xmlCorrServer = ecoconfig.apps[0].env_production.html2xmlCorrServer;
    pageExpressServer = ecoconfig.apps[0].env_production.pageExpressServer;
    nodiSupportingServer = ecoconfig.apps[0].env_production.nodiSupportingServer;
    xml2htmlServerBooks = ecoconfig.apps[0].env_production.xml2htmlServerBooks;
    html2xmlServerBooks = ecoconfig.apps[0].env_production.html2xmlServerBooks;
	checkTexServer = ecoconfig.apps[0].env_production.checkTexServer;
    jnls_ce = ecoconfig.apps[0].env_production['ce'];
    jnls_act = ecoconfig.apps[0].env_production['act'];
    books_ce = ecoconfig.apps[0].env_production['bk-ce'];
    books_act = ecoconfig.apps[0].env_production['bk-act'];
    book_ce_pgx = ecoconfig.apps[0].env_production['bk-ce-pgx'];
    book_act_pgx = ecoconfig.apps[0].env_production['bk-act-pgx'];
    ce_pgx = ecoconfig.apps[0].env_production['ce-pgx'];
    act_pgx = ecoconfig.apps[0].env_production['act-pgx'];
    xml2htmlServerBooksCorr = ecoconfig.apps[0].env_production.xml2htmlServerBooksCorr;
    html2xmlServerBooksCorr = ecoconfig.apps[0].env_production.html2xmlServerBooksCorr;
    chennai = ecoconfig.apps[0].env_production.chennai;
    trichy = ecoconfig.apps[0].env_production.trichy;
    updateDB_url = ecoconfig.apps[0].env_production.updateDB_url;
    esmList_url = ecoconfig.apps[0].env_production.esmList_url;
    esmRename_url = ecoconfig.apps[0].env_production.esmRename_url;
    dbPath = ecoconfig.apps[0].env_production.dbPath;
}


module.exports = {
    filepath,
    port,
    html2xmlServerurl,
    contentcheckerserverurl,
    imagePath,
    imageServerPath,
    arsServer,
    arsServerPort,
    arsPath,
    refmlServer,
    refmlServerPort,
    refmlPath,
    refRecal,
    spellServer,
    cslserver,
    serveImageNotfoundfile,
    uploadfilepath,
    xml2htmlServer,
    logPath,
    node_env,
    kibanaServer,
    hostName,
    cslclient,
    processAffliation,
    trackChange,
    xml2htmlServerCorr,
    nodiindesignServer,
    copyXMLServer,
    html2xmlCorrServer,
    pageExpressServer,
    nodiSupportingServer,
    forkPath,
    xml2htmlServerBooks,
    html2xmlServerBooks,
    checkTexServer,
    'ce': jnls_ce,
    'act': jnls_act,
    'bk-ce': books_ce,
    'bk-act': books_act,
    'bk-ce-pgx': book_ce_pgx,
    'bk-act-pgx': book_act_pgx,
    'ce-pgx': ce_pgx,
    'act-pgx': act_pgx,
    xml2htmlServerBooksCorr,
    html2xmlServerBooksCorr,
    chennai,
    trichy,
    updateDB_url,
    esmList_url,
    esmRename_url,
    dbPath
}