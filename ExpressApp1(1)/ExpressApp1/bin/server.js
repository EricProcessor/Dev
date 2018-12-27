"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
//import * as express from "express";
const bodyParser = require("body-parser");
const AADTokens_1 = require("./AADTokens");
const AAD_1 = require("./AAD");
const Logger_1 = require("./Logger");
const MEEServices = require("./MEEServices");
const environment_1 = require("./core/environment");
const moment = require('moment');
const version_edu_evaluation = 65596;
const version_edu_earlyaccess = 65598;
const version_codebuilder_beta = 110;
const app = express();
const useFiddler = false;
if (environment_1.Environment.isLocalDev() && useFiddler) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // Ignore 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' authorization error
    process.env['HTTP_PROXY'] = "http://127.0.0.1:8888";
    process.env['HTTPS_PROXY'] = "http://127.0.0.1:8888";
}
app.use(bodyParser.json());
app.set('port', process.env.PORT || 1337);
app.use(express.static('public'));
// -------------------------------------------------
app.get('/', function root(req, res) {
    res.type('text/plain');
    res.send("Hello, This is a License Server for MEE!");
});
app.post('/signin', function signin(req, res) {
    res.type('application/json');
    try {
        if (!((req.body && req.body.clientVersion))) {
            let reason = 'Invalid post data - no body and client version';
            Logger_1.logActivity('server-signin-invalid', reason, '', req.body);
            res.send(JSON.stringify({ "isValid": false, "reason": reason }));
            return;
        }
        let clientVersion = parseInt(req.body.clientVersion); // this is the 'protocol version' from MC
        let isEarlyAccess = clientVersion >= version_edu_earlyaccess;
        if (isEarlyAccess) {
            if (environment_1.Environment.isStaging() || moment().isAfter('2016-12-31')) {
                let reason = 'Invalid client - edu_earlyaccess';
                Logger_1.logActivity('server-signin-invalid', reason, '', req.body);
                res.send(JSON.stringify({ "isValid": false, "reason": reason }));
                return;
            }
        }
        if (clientVersion === version_edu_evaluation) {
            let reason = 'Invalid client - edu_evaluation';
            Logger_1.logActivity('server-signin-invalid', reason, '', req.body);
            res.send(JSON.stringify({ "isValid": false, "reason": reason }));
            return;
        }
        if (clientVersion === version_codebuilder_beta) {
            let reason = 'Invalid client - codebuilder_beta';
            Logger_1.logActivity('server-signin-invalid', reason, '', req.body);
            res.send(JSON.stringify({ "isValid": false, "reason": reason }));
            return;
        }
        let invalidPostDataReason = '';
        if (!req.body.accessToken) {
            invalidPostDataReason = "Invalid post data: accessToken";
        }
        else if (!req.body.identityToken) {
            invalidPostDataReason = "Invalid post data: identityToken";
        }
        else if (!req.body.build) {
            invalidPostDataReason = "Invalid post data: build";
        }
        else if (!req.body.platform) {
            invalidPostDataReason = "Invalid post data: platform";
        }
        if (invalidPostDataReason) {
            Logger_1.logActivity('server-signin-invalid', invalidPostDataReason, '', req.body);
            let result = { "isValid": false, "reason": invalidPostDataReason };
            MEEServices.trackWarning(result);
            res.send(JSON.stringify(result));
            return;
        }
        let identity = AADTokens_1.AADIdentity.fromToken(req.body.identityToken);
        if (!identity) {
            throw Error("Invalid identity token!");
        }
        if (identity.expirationDate < new Date()) {
            throw Error(`Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`);
        }
        let user = new AAD_1.UserID(identity.tenantId, identity.uniqueName, identity.userName, identity.name, identity.oid, req.body.accessToken, undefined, undefined, undefined, undefined, req.body.platform, req.body.locale);
        if (user && user.unique_name.startsWith("live.com#")) {
            let reason = 'Invalid token type: MSA';
            Logger_1.logActivity('server-signin-invalid', reason, user.unique_name, req.body);
            res.send(JSON.stringify({ "isValid": false, "reason": reason }));
            return;
        }
        user.clientApplication = 'Minecraft';
        if (isEarlyAccess) {
            MEEServices.signInEarlyAccess(res, user, req.body);
        }
        else {
            user.clientDisplayVersion = req.body.displayVersion;
            user.osVersion = req.body.osVersion;
            MEEServices.signIn(res, user, req.body);
        }
    }
    catch (error) {
        Logger_1.logActivity('server-signin-error', '#error', error.message, req.body);
        MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false, reason: `${error.message}` }));
    }
});
// -------------------------------------------------
app.post('/cmsignin', function cmsignin(req, res) {
    // called by classroom mode
    res.type('application/json');
    try {
        if (!((req.body &&
            req.body.accessToken &&
            req.body.identityToken &&
            true) || false)) {
            throw Error("Invalid post data");
        }
        let identity = AADTokens_1.AADIdentity.fromToken(req.body.identityToken);
        if (!identity) {
            throw Error("Invalid identity token");
        }
        Logger_1.logActivity('cmsignin', identity.tenantId, identity.uniqueName, req.body);
        if (identity.expirationDate < new Date()) {
            throw Error(`Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`);
        }
        let user = new AAD_1.UserID(identity.tenantId, identity.uniqueName, identity.userName, identity.name, identity.oid, req.body.accessToken);
        user.clientApplication = 'ClassroomMode';
        user.clientDisplayVersion = req.body.applicationVersion;
        user.osVersion = req.body.osVersion;
        MEEServices.classroomModeSignin(res, user);
    }
    catch (error) {
        Logger_1.logActivity('/cmsignin', '#error', error.message, req.body);
        MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false }));
    }
});
// -------------------------------------------------
app.post('/getuserguid', function getuserguid(req, res) {
    // called by classroom mode
    res.type('application/json');
    try {
        if (!((req.body &&
            req.body.accessToken &&
            req.body.identityToken &&
            true) || false)) {
            throw Error("Invalid post data");
        }
        let identity = AADTokens_1.AADIdentity.fromToken(req.body.identityToken);
        if (!identity) {
            throw Error("Invalid identity token");
        }
        if (identity.expirationDate < new Date()) {
            throw Error(`Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`);
        }
        Logger_1.logActivity('getuserguid', identity.tenantId, identity.uniqueName, req.body);
        let user = new AAD_1.UserID(identity.tenantId, identity.uniqueName, identity.userName, identity.name, identity.oid, req.body.accessToken);
        MEEServices.registerUserGuid(res, user, req.body.ipAddress);
        Logger_1.logActivity('getuserguid-success', identity.tenantId, identity.uniqueName, req.body);
    }
    catch (error) {
        Logger_1.logActivity('/getuserguid', '#error', error.message, req.body);
        MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false }));
    }
});
// -------------------------------------------------
app.post('/validateuserguid', function validateuserguid(req, res) {
    res.type('application/json');
    // called by mc client in cm scenario
    try {
        if (!((req.body &&
            req.body.guid &&
            true) || false)) {
            throw Error("Invalid post data");
        }
        Logger_1.logActivity('validateuserguid', '', '', req.body);
        MEEServices.validateUserGuid(res, req.body.guid);
        Logger_1.logActivity('validateuserguid', '', '', req.body);
    }
    catch (error) {
        Logger_1.logActivity('/validateuserguid', '#error', error.message, req.body);
        MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false }));
    }
});
// -------------------------------------------------
app.post('/skin', function skin(req, res) {
    res.type('application/json');
    try {
        if (!((req.body &&
            req.body.clientVersion &&
            req.body.build &&
            req.body.identityToken &&
            req.body.skin &&
            true) || false)) {
            throw Error("Invalid post data");
        }
        let identity = AADTokens_1.AADIdentity.fromToken(req.body.identityToken);
        if (!identity) {
            throw Error("Invalid identity token");
        }
        if (identity.expirationDate < new Date()) {
            let reason = 'Expired identity token';
            Logger_1.logActivity('skin', reason, '', req.body);
            res.send(JSON.stringify({ "isValid": false, "reason": reason }));
            return;
        }
        let user = new AAD_1.UserID(identity.tenantId, identity.uniqueName, identity.userName, identity.name, identity.oid, "");
        let skin = req.body.skin;
        Logger_1.logActivity('setSkin', user.tenantId, user.unique_name, req.body);
        MEEServices.setSkin(res, user, skin);
    }
    catch (error) {
        Logger_1.logActivity('/setSkin', '#error', error.message, req.body);
        MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false }));
    }
});
// -------------------------------------------------
app.post('/eula', function eula(req, res) {
    res.type('application/json');
    try {
        if (!((req.body &&
            req.body.clientVersion &&
            req.body.build &&
            req.body.identityToken &&
            true) || false)) {
            throw Error("Invalid post data");
        }
        let identity = AADTokens_1.AADIdentity.fromToken(req.body.identityToken);
        if (!identity) {
            throw Error("Invalid identity token");
        }
        if (identity.expirationDate < new Date()) {
            throw Error(`Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`);
        }
        let user = new AAD_1.UserID(identity.tenantId, identity.uniqueName, identity.userName, identity.name, identity.oid, "");
        Logger_1.logActivity('eula', user.tenantId, user.unique_name, req.body);
        MEEServices.acceptEula(res, user);
    }
    catch (error) {
        Logger_1.logActivity('/eula', '#error', error.message, req.body);
        MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false }));
    }
});
if (!environment_1.Environment.isProduction()) {
    // this section is testing endpoints
    app.get('/logexception', function logexception(req, res) {
        res.type('text/plain');
        MEEServices.trackException(new Error("this is an error"));
        res.send("i logged an exception!");
    });
    app.get('/env', function env(req, res) {
        res.type('text/plain');
        Logger_1.logActivity('env', '', '', req.body);
        res.send(process.env);
    });
    // e.g.  http://localhost:1337/getUserInfo?id=markgrin@microsoft.com
    app.get('/getUserInfo', function getUserInfo(req, res) {
        res.type('application/json');
        Logger_1.logActivity('getUserInfo', '', '', req.query.id);
        MEEServices.getUserInfo(res, req.query.id);
    });
    // e.g.  http://meeservices-staging/deleteUser?id=markgrin@microsoft.com
    app.get('/deleteUser', function deleteUser(req, res) {
        res.type('application/json');
        Logger_1.logActivity('deleteUser', '', '', req.query.id);
        MEEServices.deleteUser(res, req.query.id);
    });
    // e.g.  http://localhost:1337/setTrialCounts?id=markgrin@microsoft.com&trialsAllowed=22&trialsUsed=3
    app.get('/setTrialCounts', function setTrialCounts(req, res) {
        res.type('application/json');
        Logger_1.logActivity('setTrialCounts', '', '', req.query);
        let trialsAllowed = parseInt(req.query.trialsAllowed);
        let trialsUsed = parseInt(req.query.trialsUsed);
        MEEServices.setTrialCounts(res, req.query.id, trialsAllowed, trialsUsed);
    });
}
// -------------------------------------------------
app.post('/setReceipt', function setReceipt(req, res) {
    res.type('application/json');
    try {
        if (!((req.body &&
            req.body.clientVersion &&
            req.body.build &&
            req.body.identityToken &&
            req.body.receipt &&
            req.body.aoid &&
            true) || false)) {
            throw Error("Invalid post data");
        }
        let identity = AADTokens_1.AADIdentity.fromToken(req.body.identityToken);
        if (!identity) {
            throw Error("Invalid identity token");
        }
        if (identity.expirationDate < new Date()) {
            throw Error(`Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`);
        }
        let user = new AAD_1.UserID(identity.tenantId, identity.uniqueName, identity.userName, identity.name, identity.oid, "");
        let receipt = req.body.receipt;
        let anonimizedOid = req.body.aoid;
        Logger_1.logActivity('setReceipt', anonimizedOid, user.unique_name, JSON.stringify(req.body).substring(0, 1024));
        MEEServices.setReceipt(res, anonimizedOid, user, receipt);
    }
    catch (error) {
        Logger_1.logActivity('/setReceipt', '#error', error.message, JSON.stringify(req.body).substring(0, 1024));
        MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false }));
    }
});
//================================ DO NOT ADD NEW HANDLERS BELOW HERE ==================================
// custom 404 page
app.use(function (req, res) {
    MEEServices.send404(req, res);
});
// custom 500 page
app.use(function (err, req, res, next) {
    MEEServices.send500(req, res, err);
});
app.listen(app.get('port'), function () {
    console.log('Express start on port ' + app.get('port') + '...');
});
//# sourceMappingURL=server.js.map