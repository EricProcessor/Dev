import express = require('express')
//import * as express from "express";
import * as bodyParser from "body-parser";
import { AADIdentity } from "./AADTokens";
import { UserID } from "./AAD";
import { getOnBehalfOfToken } from "./AAD";
import { logActivity, logActivityVerbose } from "./Logger";
import * as MEEServices from "./MEEServices";
import * as Utilities from "./utilities";
import {Environment, EnvironmentType} from "./core/environment"
import {UserTable} from "./MeeUserTable"
import { Config } from "./Config"
// const easyMonitor = require('easy-monitor');
// easyMonitor('你的项目名称');
const moment = require('moment');

const version_edu_evaluation = 65596;
const version_edu_earlyaccess = 65598;
const version_codebuilder_beta = 110;

const app = express();

const useFiddler = false;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

app.set('port', process.env.PORT || 1337);
app.use(express.static('public'));

console.log("UserName"+process.env.UserName)
console.log("Password"+process.env.Password)
console.log("JdMongoUrl"+process.env.JdMongoUrl)

// -------------------------------------------------
app.get('/', function root(req, res) {
    res.type('text/plain');
    res.send("Hello, This is a License Server for MEE!");
});

app.post('/signin', function signin(req, res) {
    res.type('application/json');

    try {
        if (!((req.body && req.body.clientVersion))) {//验证有没有post请求和请求有没有clientVersion
            let reason = 'Invalid post data - no body and client version';
            logActivity('server-signin-invalid', reason, '', req.body);
            res.send(JSON.stringify({ "isValid": false, "reason": reason }));
            return;
        }

        let clientVersion = parseInt(req.body.clientVersion);   // this is the 'protocol version' from MC
        let isEarlyAccess: boolean = clientVersion >= version_edu_earlyaccess;//布尔值
        if (isEarlyAccess) {
            if (Environment.isStaging() || moment().isAfter('2016-12-31')) {
                let reason = 'Invalid client - edu_earlyaccess';
                logActivity('server-signin-invalid', reason, '', req.body);
                res.send(JSON.stringify({ "isValid": false, "reason": reason }));
                return;
            }
        }

        if (clientVersion === version_edu_evaluation) {
            let reason = 'Invalid client - edu_evaluation';
            logActivity('server-signin-invalid', reason, '', req.body);
            res.send(JSON.stringify({ "isValid": false, "reason": reason }));
            return;
        }

        if (clientVersion === version_codebuilder_beta) {
            let reason = 'Invalid client - codebuilder_beta';
            logActivity('server-signin-invalid', reason, '', req.body);
            res.send(JSON.stringify({ "isValid": false, "reason": reason }));
            return;
        }

        let invalidPostDataReason: string = '';
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
            logActivity('server-signin-invalid', invalidPostDataReason, '', req.body);
            let result = { "isValid": false, "reason": invalidPostDataReason };
            // MEEServices.trackWarning(result);
            res.send(JSON.stringify(result));
            return;
        }

        let identity = AADIdentity.fromToken(req.body.identityToken);
        if (!identity) {
            throw Error("Invalid identity token!");
        }

        if (identity.expirationDate < new Date()) {
            throw Error(`Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`);
        }
        console.log("$$$$$$$$$$$$$$$$$$###########@@@@@@@@@@!!!!!!!!!!^identity.uniqueName++++++++++这个事++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++少时诵诗书所所所"+identity.uniqueName);
        let user = new UserID(identity.tenantId, identity.uniqueName, identity.userName, identity.name, identity.oid, req.body.accessToken, undefined, undefined, undefined, undefined, req.body.platform, req.body.locale);
        
        if (user && user.unique_name.startsWith("live.com#")) {
            let reason = 'Invalid token type: MSA';
            logActivity('server-signin-invalid', reason, user.unique_name, req.body);
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

    } catch (error) {
        logActivity('server-signin-error', '#error', error.message, req.body);
        // MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false, reason: `${error.message}` }));
    }
});

// -------------------------------------------------
app.post('/cmsignin', function cmsignin(req, res) {
    // called by classroom mode
    res.type('application/json');

    try {
        if (!((
            req.body &&
            req.body.accessToken &&
            req.body.identityToken &&
            true) || false)) {
            throw Error("Invalid post data");
        }

        let identity = AADIdentity.fromToken(req.body.identityToken);
        if (!identity) {
            throw Error("Invalid identity token");
        }

        logActivity('cmsignin', identity.tenantId, identity.uniqueName, req.body);

        if (identity.expirationDate < new Date()) {
            throw Error(`Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`);
        }

        let user = new UserID(identity.tenantId, identity.uniqueName, identity.userName, identity.name, identity.oid, req.body.accessToken);
        user.clientApplication = 'ClassroomMode';
        user.clientDisplayVersion = req.body.applicationVersion;
        user.osVersion = req.body.osVersion;
        MEEServices.classroomModeSignin(res, user);

    } catch (error) {
        logActivity('/cmsignin', '#error', error.message, req.body);
        // MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false }));
    }
});

// -------------------------------------------------
app.post('/getuserguid', function getuserguid(req, res) {
    // called by classroom mode
    res.type('application/json');
    console.log("进入getuserguid方法")
    try {
        if (!((
            req.body &&
            req.body.accessToken &&
            req.body.identityToken &&
            true) || false)) {
            throw Error("Invalid post data");
        }
        
        let identity = AADIdentity.fromToken(req.body.identityToken);
        
        if (!identity) {
            throw Error("Invalid identity token");
        }

        if (identity.expirationDate < new Date()) {
            throw Error(`Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`);
        }

        logActivity('getuserguid', identity.tenantId, identity.uniqueName, req.body);
        let user = new UserID(identity.tenantId, identity.uniqueName, identity.userName, identity.name, identity.oid, req.body.accessToken);
        console.log("registerUserGuid----"+JSON.stringify(req.body.ipAddress))
        MEEServices.registerUserGuid(res, user, req.body.ipAddress);
        logActivity('getuserguid-success', identity.tenantId, identity.uniqueName, req.body);
    } catch (error) {
        logActivity('/getuserguid', '#error', error.message, req.body);
        // MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false }));
    }
});

// -------------------------------------------------
app.post('/validateuserguid', function validateuserguid(req, res) {
    res.type('application/json');
    // called by mc client in cm scenario

    try {
        if (!((
            req.body &&
            req.body.guid &&
            true) || false)) {
            throw Error("Invalid post data");
        }

        logActivity('validateuserguid', '', '', req.body);

        MEEServices.validateUserGuid(res, req.body.guid);
        logActivity('validateuserguid', '', '', req.body);
    } catch (error) {
        logActivity('/validateuserguid', '#error', error.message, req.body);
        // MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false }));
    }
});

// -------------------------------------------------
app.post('/skin', function skin(req, res) {
    res.type('application/json');
    // let idinfo =AADIdentity.fromToken(req.body.identityToken)
    // res.send(idinfo);
    
    try {
        if (!((
            req.body &&
            req.body.clientVersion &&
            req.body.build &&
            req.body.identityToken &&
            req.body.skin &&
            true) || false)) {
            throw Error("Invalid post data");
        }

        let identity = AADIdentity.fromToken(req.body.identityToken);
        console.log("identity-----"+JSON.stringify(identity));
        if (!identity) {
            throw Error("Invalid identity token");
        }

        if (identity.expirationDate < new Date()) {
            let reason = 'Expired identity token';
            logActivity('skin', reason, '', req.body);
            res.send(JSON.stringify({ "isValid": false, "reason": reason }));
            return;
        }

        let user = new UserID(identity.tenantId, identity.uniqueName, identity.userName, identity.name, identity.oid, "");

        let skin = req.body.skin;

        logActivity('setSkin', user.tenantId, user.unique_name, req.body);

        MEEServices.setSkin(res, user, skin);

    } catch (error) {
        logActivity('/setSkin', '#error', error.message, req.body);
        // MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false }));
    }
});

// -------------------------------------------------
app.post('/eula', function eula(req, res) {
    res.type('application/json');
    console.log("进入eula方法")
    try {
        if (!((
            req.body &&
            req.body.clientVersion &&
            req.body.build &&
            req.body.identityToken &&
            true) || false)) {
            throw Error("Invalid post data");
        }

        let identity = AADIdentity.fromToken(req.body.identityToken);
        
        if (!identity) {
            throw Error("Invalid identity token");
        }

        if (identity.expirationDate < new Date()) {
            throw Error(`Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`);
        }

        let user = new UserID(identity.tenantId, identity.uniqueName, identity.userName, identity.name, identity.oid, "");
        console.log("identity-----user"+JSON.stringify(user))
        logActivity('eula', user.tenantId, user.unique_name, req.body);

        MEEServices.acceptEula(res, user);

    } catch (error) {
        logActivity('/eula', '#error', error.message, req.body);
        // MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false }));
    }
});

console.log("查看下当前的环境：  " + Environment.isProduction())

if (!Environment.isProduction()) {

    // this section is testing endpoints
    app.get('/logexception', function logexception(req, res) {
        res.type('text/plain');
        // MEEServices.trackException(new Error("this is an error"));
        res.send("i logged an exception!");
    });

    app.get('/env', function env(req, res) {
        res.type('text/plain');
        logActivity('env', '', '', req.body);
        res.send(process.env);
    });

    // e.g.  http://localhost:1337/getUserInfo?id=markgrin@microsoft.com
    app.get('/getUserInfo', function getUserInfo(req, res) {
        res.type('application/json');
        logActivity('getUserInfo', '', '', req.query.id);
        MEEServices.getUserInfo(res, req.query.id);
    });

    // e.g.  http://meeservices-staging/deleteUser?id=markgrin@microsoft.com
    app.get('/deleteUser', function deleteUser(req, res) {
        res.type('application/json');
        logActivity('deleteUser', '', '', req.query.id);
        MEEServices.deleteUser(res, req.query.id);
    });

    // e.g.  http://localhost:1337/setTrialCounts?id=markgrin@microsoft.com&trialsAllowed=22&trialsUsed=3
    app.get('/setTrialCounts', function setTrialCounts(req, res) {
        res.type('application/json');
        logActivity('setTrialCounts', '', '', req.query);
        let trialsAllowed: number = parseInt(req.query.trialsAllowed);
        let trialsUsed: number = parseInt(req.query.trialsUsed);
        MEEServices.setTrialCounts(res, req.query.id, trialsAllowed, trialsUsed);
    });
}

// -------------------------------------------------
app.post('/setReceipt', function setReceipt(req, res) {
    res.type('application/json');

    try {
        if (!((
            req.body &&
            req.body.clientVersion &&
            req.body.build &&
            req.body.identityToken &&
            req.body.receipt &&
            req.body.aoid &&
            true) || false)) {
            throw Error("Invalid post data");
        }

        let identity = AADIdentity.fromToken(req.body.identityToken);
        if (!identity) {
            throw Error("Invalid identity token");
        }

        if (identity.expirationDate < new Date()) {
            throw Error(`Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`);
        }
        
        let user = new UserID(identity.tenantId, identity.uniqueName, identity.userName, identity.name, identity.oid, "");

        let receipt = req.body.receipt;
        let anonimizedOid = req.body.aoid;

        logActivity('setReceipt', anonimizedOid, user.unique_name, JSON.stringify(req.body).substring(0, 1024));

        MEEServices.setReceipt(res, anonimizedOid, user, receipt);

    } catch (error) {
        logActivity('/setReceipt', '#error', error.message, JSON.stringify(req.body).substring(0, 1024));
        // MEEServices.trackException(error);
        res.send(JSON.stringify({ "isValid": false }));
    }
});


//================================ DO NOT ADD NEW HANDLERS BELOW HERE ==================================

// custom 404 page
app.use(function (req, res) {
    MEEServices.send404(req, res);
});

// custom 500 page
app.use(<express.ErrorRequestHandler>function (err, req, res, next) {
    MEEServices.send500(req, res, err);
});

app.listen(app.get('port'), function () {
    console.log('Express start on port ' + app.get('port') + '...');
});

