import express = require("express");
//import * as express from "express";
import * as bodyParser from "body-parser";
import { AADIdentity } from "./AADTokens";
import { UserID } from "./AAD";
import { getOnBehalfOfToken, getCertPrivateKey, getCertThumbprint } from "./AAD";
import { logActivity, logActivityVerbose } from "./Logger";
import * as MEEServices from "./MEEServices";
import * as Utilities from "./utilities";
import { Environment, EnvironmentType } from "./core/environment";
import { UserTable } from "./MeeUserTable";
import { Config } from "./Config";
const uuid = require('uuid');
// import { request } from 'https';
const MongoClient = require("mongodb").MongoClient;
const jwt = require("jsonwebtoken");
var options = {  
    auto_reconnect: true,
    useNewUrlParser:true
};
// let devlop = true;
// let dbUrl: string = Environment.isProduction()
//     ? "mongodb://root:Eq9RQ80J@jmongo-hb1-prod-mongo-t392nvqc111.jmiss.jdcloud.com:27017,jmongo-hb1-prod-mongo-t392nvqc112.jmiss.jdcloud.com:27017/admin?replicaSet=mgset-2242988359"
//     : "mongodb://127.0.0.1:27017"; //设置数据库的连接地址
let dbUrl: string = "mongodb://root:Eq9RQ80J@jmongo-hb1-prod-mongo-t392nvqc111.jmiss.jdcloud.com:27017,jmongo-hb1-prod-mongo-t392nvqc112.jmiss.jdcloud.com:27017/admin?replicaSet=mgset-2242988359";
const moment = require("moment");
const request = require("request");

const version_edu_evaluation = 65596;
const version_edu_earlyaccess = 65598;
const version_codebuilder_beta = 110;

const app = express();

const useFiddler = false;

if (Environment.isLocalDev() && useFiddler) {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"; // Ignore 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' authorization error
    process.env["HTTP_PROXY"] = "http://127.0.0.1:8888";
    process.env["HTTPS_PROXY"] = "http://127.0.0.1:8888";
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set("port", process.env.PORT || 1337);
app.use(express.static("public"));

// -------------------------------------------------
app.get("/", function root(req, res) {
    res.type("text/plain");
    res.send("Hello, This is a License Server for MEE!");
    // res.end('<form action="http://116.196.92.36/oauth" method="post"><input type="text" style="width: 300px; height: 30px; line-height: 30px;" name="username" placeholder="用户名"><br><br><input type="password" style="width: 300px; height: 30px; line-height: 30px;"  name="password" placeholder="密　码"><br><br><input type="submit" style="width: 100px; height: 30px; text-align: center; line-height: 30px;" value="登录" /></form>')
    //res.redirect("http://116.196.92.36/oauth")/
});
//--------signin接口，负责接收--------
app.post("/signin", function (req, res) {
    res.type("application/json");
    console.log("进入signin");
    console.log("数据库地址"+dbUrl);
    console.log(req.body);
    if(req.body && req.body.access_token){
        let userInfoStr = JSON.stringify(req.body);
        let userInfoJson = JSON.parse(userInfoStr);
        //col.update(key, data, {upsert:true})
        MongoClient.connect(
            dbUrl,options,
            (err, client) => {
                const db = client.db("Table");
                console.log("数据库地址" + dbUrl);
                if (err) {
                    console.log(err);
                    return;
                };
                //插入时间戳
                userInfoJson.timestamp = (new Date()).getTime();
                //用户状态
                userInfoJson.status = 0;
                // 连接成功后，进行 添加数据
                // 查重后添加数据
                let userId = userInfoJson.userid;
                
                db.collection("Users").findOne({"userid": userId},(error, items)=>{
                    if(error){
                        console.log(error);
                        return;
                    }

                    console.log("这里的是items，看看有没有值：" + JSON.stringify(items))

                    if(!items){
                        //新用户执行插入操作
                        userInfoJson.userid = userId;
                        userInfoJson.aud = "https://meeservices.minecraft.net";
                        userInfoJson.iss = "https://sts.windows.net/38dd6634-1931-4c59-a9b4-d16cd9d97d57/";
                        userInfoJson.iat = "1546998515";
                        userInfoJson.nbf = "1546998515";
                        userInfoJson.exp = "1546998515";
                        userInfoJson.acr = "1";
                        userInfoJson.aio = "421AApF60RfBj7soft180FF3uVVO1P";
                        userInfoJson.appid = "b36b1432-1a1c-4c82-9b76-24de1cab42f2";
                        userInfoJson.amr = ["pwd"];
                        userInfoJson.appidacr = "0";
                        userInfoJson.deviceid = "ce84205d-7de2-4a75-83a8-4f7abe80f67c";
                        userInfoJson.family_name = "フラグ";
                        userInfoJson.given_name = "ブラック";
                        userInfoJson.ipaddr = "167.220.2.189";
                        userInfoJson.name = "Tラックフラグ";
                        userInfoJson.oid = uuid.v1();
                        userInfoJson.puid = "10037FFE9995AD69";
                        userInfoJson.scp = "user_impersonation";
                        userInfoJson.sub = "t6aAd90jCLrex51aabS4Zqyf8_aSpHxTuB9B9jpvpL8";
                        userInfoJson.tid = "38dd6634-1931-4c50-a9b4-d16cd9d97d57";
                        userInfoJson.unique_name = "stu15@usmie.com";
                        userInfoJson.upn = "stu15 @usmie.com";
                        userInfoJson.uti = "R74NFhfd0EWX9wTPhaQLAA";
                        userInfoJson.ver = "1.0";
                        console.log("这里的是userInfoJson: " + JSON.stringify(userInfoJson))
                        db.collection("Users").insertOne(userInfoJson, (error, data) => {
                            if (error) {
                                console.log(error);
                                return;
                            }
                            console.log("插入数据成功111" + JSON.stringify(userInfoJson));
                        });
                    }else{
                         //存在的用户执行查询getUserInfo
                         userInfoJson = queryMongodb(userId,db);
                    }
                    client.close();
                })
                var getB2BToken = jwt.sign(userInfoJson, getCertPrivateKey(), { algorithm: 'RS256', 'header': { 'x5t': getCertThumbprint() } });
                console.log(getB2BToken);
                res.send(JSON.stringify({ "accessToken":getB2BToken, "status" : "0000" }));
                return;
                
            }
        );
    }
    
})
// -------------------------------------------------
app.post("/cmsignin", function cmsignin(req, res) {
    // called by classroom mode
    res.type("application/json");

    try {
        if (
            !(
                (req.body && req.body.accessToken && req.body.identityToken && true) ||
                false
            )
        ) {
            throw Error("Invalid post data");
        }

        let identity = AADIdentity.fromToken(req.body.identityToken);
        if (!identity) {
            throw Error("Invalid identity token");
        }

        logActivity("cmsignin", identity.tenantId, identity.uniqueName, req.body);

        if (identity.expirationDate < new Date()) {
            throw Error(
                `Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`
            );
        }

        let user = new UserID(
            identity.tenantId,
            identity.uniqueName,
            identity.userName,
            identity.name,
            identity.oid,
            req.body.accessToken
        );
        user.clientApplication = "ClassroomMode";
        user.clientDisplayVersion = req.body.applicationVersion;
        user.osVersion = req.body.osVersion;
        MEEServices.classroomModeSignin(res, user);
    } catch (error) {
        logActivity("/cmsignin", "#error", error.message, req.body);
        MEEServices.trackException(error);
        res.send(JSON.stringify({ isValid: false }));
    }
});

// -------------------------------------------------
app.post("/getuserguid", function getuserguid(req, res) {
    // called by classroom mode
    res.type("application/json");

    try {
        if (
            !(
                (req.body && req.body.accessToken && req.body.identityToken && true) ||
                false
            )
        ) {
            throw Error("Invalid post data");
        }

        let identity = AADIdentity.fromToken(req.body.identityToken);

        if (!identity) {
            throw Error("Invalid identity token");
        }

        if (identity.expirationDate < new Date()) {
            throw Error(
                `Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`
            );
        }

        logActivity(
            "getuserguid",
            identity.tenantId,
            identity.uniqueName,
            req.body
        );

        let user = new UserID(
            identity.tenantId,
            identity.uniqueName,
            identity.userName,
            identity.name,
            identity.oid,
            req.body.accessToken
        );

        MEEServices.registerUserGuid(res, user, req.body.ipAddress);
        logActivity(
            "getuserguid-success",
            identity.tenantId,
            identity.uniqueName,
            req.body
        );
    } catch (error) {
        logActivity("/getuserguid", "#error", error.message, req.body);
        MEEServices.trackException(error);
        res.send(JSON.stringify({ isValid: false }));
    }
});

// -------------------------------------------------
app.post("/validateuserguid", function validateuserguid(req, res) {
    res.type("application/json");
    // called by mc client in cm scenario

    try {
        if (!((req.body && req.body.guid && true) || false)) {
            throw Error("Invalid post data");
        }

        logActivity("validateuserguid", "", "", req.body);

        MEEServices.validateUserGuid(res, req.body.guid);
        logActivity("validateuserguid", "", "", req.body);
    } catch (error) {
        logActivity("/validateuserguid", "#error", error.message, req.body);
        MEEServices.trackException(error);
        res.send(JSON.stringify({ isValid: false }));
    }
});

// -------------------------------------------------
app.post("/skin", function skin(req, res) {
    res.type("application/json");

    try {
        if (
            !(
                (req.body &&
                    req.body.clientVersion &&
                    req.body.build &&
                    req.body.identityToken &&
                    req.body.skin &&
                    true) ||
                false
            )
        ) {
            throw Error("Invalid post data");
        }

        let identity = AADIdentity.fromToken(req.body.identityToken);
        if (!identity) {
            throw Error("Invalid identity token");
        }

        if (identity.expirationDate < new Date()) {
            let reason = "Expired identity token";
            logActivity("skin", reason, "", req.body);
            res.send(JSON.stringify({ isValid: false, reason: reason }));
            return;
        }

        let user = new UserID(
            identity.tenantId,
            identity.uniqueName,
            identity.userName,
            identity.name,
            identity.oid,
            ""
        );

        let skin = req.body.skin;

        logActivity("setSkin", user.tenantId, user.unique_name, req.body);

        MEEServices.setSkin(res, user, skin);
    } catch (error) {
        logActivity("/setSkin", "#error", error.message, req.body);
        MEEServices.trackException(error);
        res.send(JSON.stringify({ isValid: false }));
    }
});

// -------------------------------------------------
app.post("/eula", function eula(req, res) {
    res.type("application/json");

    try {
        if (
            !(
                (req.body &&
                    req.body.clientVersion &&
                    req.body.build &&
                    req.body.identityToken &&
                    true) ||
                false
            )
        ) {
            throw Error("Invalid post data");
        }

        let identity = AADIdentity.fromToken(req.body.identityToken);
        if (!identity) {
            throw Error("Invalid identity token");
        }

        if (identity.expirationDate < new Date()) {
            throw Error(
                `Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`
            );
        }

        let user = new UserID(
            identity.tenantId,
            identity.uniqueName,
            identity.userName,
            identity.name,
            identity.oid,
            ""
        );

        logActivity("eula", user.tenantId, user.unique_name, req.body);

        MEEServices.acceptEula(res, user);
    } catch (error) {
        logActivity("/eula", "#error", error.message, req.body);
        MEEServices.trackException(error);
        res.send(JSON.stringify({ isValid: false }));
    }
});

console.log("查看下当前的环境：  " + Environment.isProduction());

if (!Environment.isProduction()) {
    console.log("进入本地环境路由");
    // this section is testing endpoints
    app.get("/logexception", function logexception(req, res) {
        res.type("text/plain");
        MEEServices.trackException(new Error("this is an error"));
        res.send("i logged an exception!");
    });

    app.get("/env", function env(req, res) {
        res.type("text/plain");
        logActivity("env", "", "", req.body);
        res.send(process.env);
    });

    // e.g.  http://localhost:1337/getUserInfo?id=markgrin@microsoft.com
    app.get("/getUserInfo", function getUserInfo(req, res) {
        res.type("application/json");
        // logActivity("getUserInfo", "", "", req.query.id);
        // MEEServices.getUserInfo(res, req.query.id);
        let userid = req.query.userid;
        console.log(userid);
        MongoClient.connect(dbUrl,options,
            (err, client) => {
                const db = client.db("Table");
                console.log("数据库地址" + dbUrl);
                if (err) {
                    console.log(err);
                    return;
                };
                let userInfo = queryMongodb(userid-0,db);
                console.log("userInfo"+userInfo);
                res.send(JSON.stringify({ "userInfo":userInfo, "status" : "0000" }));
                client.close();
            }
        );
    });

    // e.g.  http://meeservices-staging/deleteUser?id=markgrin@microsoft.com
    app.get("/deleteUser", function deleteUser(req, res) {
        res.type("application/json");
        // logActivity("deleteUser", "", "", req.query.id);
        // MEEServices.deleteUser(res, req.query.id);
        let userId = req.query.userid;
        MongoClient.connect(dbUrl, options, (err, client) => {
            const db = client.db("Table");
            db.collection("Users").deleteMany({ "userid": userId-0 }, (error) => {
                if (error) {
                    console.log("删除数据失败")
                    return
                }
                console.log("删除数据成功！");
                db.close();
                res.send(JSON.stringify({ "status" : "0000" ,"msg" : "删除数据成功" }));
            })
        });
    });

    // e.g.  http://localhost:1337/setTrialCounts?id=markgrin@microsoft.com&trialsAllowed=22&trialsUsed=3
    app.get("/setTrialCounts", function setTrialCounts(req, res) {
        res.type("application/json");
        logActivity("setTrialCounts", "", "", req.query);
        let trialsAllowed: number = parseInt(req.query.trialsAllowed);
        let trialsUsed: number = parseInt(req.query.trialsUsed);
        MEEServices.setTrialCounts(res, req.query.id, trialsAllowed, trialsUsed);
    });
    
}
// -------------------------------------------------
app.post("/setReceipt", function setReceipt(req, res) {
    res.type("application/json");

    try {
        if (
            !(
                (req.body &&
                    req.body.clientVersion &&
                    req.body.build &&
                    req.body.identityToken &&
                    req.body.receipt &&
                    req.body.aoid &&
                    true) ||
                false
            )
        ) {
            throw Error("Invalid post data");
        }

        let identity = AADIdentity.fromToken(req.body.identityToken);
        if (!identity) {
            throw Error("Invalid identity token");
        }

        if (identity.expirationDate < new Date()) {
            throw Error(
                `Expired identity token. Issued: ${identity.issuedAtTime.toISOString()} Expires: ${identity.expirationDate.toISOString()}`
            );
        }

        let user = new UserID(
            identity.tenantId,
            identity.uniqueName,
            identity.userName,
            identity.name,
            identity.oid,
            ""
        );

        let receipt = req.body.receipt;
        let anonimizedOid = req.body.aoid;

        logActivity(
            "setReceipt",
            anonimizedOid,
            user.unique_name,
            JSON.stringify(req.body).substring(0, 1024)
        );

        MEEServices.setReceipt(res, anonimizedOid, user, receipt);
    } catch (error) {
        logActivity(
            "/setReceipt",
            "#error",
            error.message,
            JSON.stringify(req.body).substring(0, 1024)
        );
        MEEServices.trackException(error);
        res.send(JSON.stringify({ isValid: false }));
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

app.listen(app.get("port"), function () {
    console.log("Express start on port " + app.get("port") + "...");
});

function queryMongodb(userId,db){
    console.log(userId);
    db.collection("Users").findOne({"userid": userId},(error, items)=>{
        if(error){
            console.log(error);
            return;
        }
        // items.toArray(function(err,item){
        //     return JSON.stringify(item);
        // });
        console.log("查询数据1111"+JSON.stringify(items));
        return JSON.stringify(items);
    })
}
