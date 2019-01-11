import express = require("express");
//import * as express from "express";
import * as bodyParser from "body-parser";
import { AADIdentity } from "./AADTokens";
import { UserID} from "./AAD";
import { getOnBehalfOfToken,getCertPrivateKey,getCertThumbprint } from "./AAD";
import { logActivity, logActivityVerbose } from "./Logger";
import * as MEEServices from "./MEEServices";
import * as Utilities from "./utilities";
import { Environment, EnvironmentType } from "./core/environment";
import { UserTable } from "./MeeUserTable";
import { Config } from "./Config";

// import { request } from 'https';
const MongoClient = require("mongodb").MongoClient;
const jwt = require("jsonwebtoken");
// let devlop = true;
let dbUrl: string = Environment.isProduction()
  ? "mongodb://root:Eq9RQ80J@jmongo-hb1-prod-mongo-t392nvqc111.jmiss.jdcloud.com:27017,jmongo-hb1-prod-mongo-t392nvqc112.jmiss.jdcloud.com:27017/admin?replicaSet=mgset-2242988359"
  : "mongodb://127.0.0.1:27017"; //设置数据库的连接地址

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
});
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
    logActivity("getUserInfo", "", "", req.query.id);
    MEEServices.getUserInfo(res, req.query.id);
  });

  // e.g.  http://meeservices-staging/deleteUser?id=markgrin@microsoft.com
  app.get("/deleteUser", function deleteUser(req, res) {
    res.type("application/json");
    logActivity("deleteUser", "", "", req.query.id);
    MEEServices.deleteUser(res, req.query.id);
  });

  // e.g.  http://localhost:1337/setTrialCounts?id=markgrin@microsoft.com&trialsAllowed=22&trialsUsed=3
  app.get("/setTrialCounts", function setTrialCounts(req, res) {
    res.type("application/json");
    logActivity("setTrialCounts", "", "", req.query);
    let trialsAllowed: number = parseInt(req.query.trialsAllowed);
    let trialsUsed: number = parseInt(req.query.trialsUsed);
    MEEServices.setTrialCounts(res, req.query.id, trialsAllowed, trialsUsed);
  });
  app.get("/singin", function(req, res) {
    console.log(req.query.accessToken);
    let storeAccessToken = req.query.accessToken;
    console.log("sigin进入");
    if (storeAccessToken) {
      request(
        {
          url: `https://oauth2.jdcloud.com/userinfo`,
          method: "POST",
          json: true,
          headers: {
            // 'Accept': 'application/json',
            "Content-Type": "application/json",
            // 'MS-CV': correlationVector,
            Authorization: `Bearer ${storeAccessToken}`
          },
          body: {}
        },
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            let data1 = JSON.stringify(body);
            let data2 = JSON.parse(data1);
            console.log(data1); // 请求成功的处理逻辑
            console.log(data2); // 请求成功的处理逻辑
            console.log("数据库地址11111" + dbUrl);
            MongoClient.connect(
              dbUrl,
              { useNewUrlParser: true },
              (err, client) => {
                const db = client.db("localTable");
                console.log("数据库地址" + dbUrl);
                if (err) {
                  console.log("数据库连接失败");
                  console.log(err);
                  return;
                }
                // 连接成功后，进行 添加数据
                db.collection("localUser").insertOne(data2, (error, result) => {
                  if (error) {
                    console.log(error);
                    console.log("添加数据失败");
                    return;
                  }
                  console.log("插入数据成功" + data1);
                  var clientAssertion = jwt.sign(data1, getCertPrivateKey(), { algorithm: 'RS256', 'header': { 'x5t': getCertThumbprint() } });
                  console.log(clientAssertion);
                  client.close();
                  return result;
                });
              }
            );
          }
          // console.log("错误信息"+error);
        }
      );
    } else {
      console.log("不存在");
      res.redirect("/");
    }
    // res.redirect('/');
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
app.use(function(req, res) {
  MEEServices.send404(req, res);
});

// custom 500 page
app.use(<express.ErrorRequestHandler>function(err, req, res, next) {
  MEEServices.send500(req, res, err);
});

app.listen(app.get("port"), function() {
  console.log("Express start on port " + app.get("port") + "...");
});
