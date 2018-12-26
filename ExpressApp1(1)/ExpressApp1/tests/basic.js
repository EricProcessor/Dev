/// <reference path="../../ts/typings/index.d.ts" />
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
let defaultStudentUsername = 'stu23@usmie.com';
let defaultTeacherUsername = 'teach1@usmie.com';
let defaultTenantId = '38dd6634-1031-4c50-a9b4-d16cd9d97d57';
let serviceRootDevelopment = "http://localhost:1337/";
let serviceRootStaging = "https://meeservices-staging.azurewebsites.net/";
let serviceRootProduction = "https://meeservices.azurewebsites.net/";
let serviceRoot = serviceRootStaging;
let suitesToRun = ['suiteBasic'];
// Test Groupings ============================================================
let suiteBasic = {
    testSigninStudent: testSigninStudent,
    testSigninTeacher: testSigninTeacher,
    testSigninStudentEA: testSigninStudentEA,
    testSigninTeacherEA: testSigninTeacherEA,
    testGetAndValidateUserGuid: testGetAndValidateUserGuid,
    testSetSkin: testSetSkin,
    testAcceptEula: testAcceptEula
};
let testSuites = {
    suiteBasic: suiteBasic
};
// Tests ============================================================
function testSigninStudent() {
    return __awaiter(this, void 0, void 0, function* () {
        return testSignin({ username: defaultStudentUsername, role: 'student' });
    });
}
function testSigninTeacher() {
    return __awaiter(this, void 0, void 0, function* () {
        return testSignin({ username: defaultTeacherUsername, role: 'teacher' });
    });
}
function testSigninStudentEA() {
    return __awaiter(this, void 0, void 0, function* () {
        return testSignin({ username: defaultStudentUsername, role: 'student', isEA: true });
    });
}
function testSigninTeacherEA() {
    return __awaiter(this, void 0, void 0, function* () {
        return testSignin({ username: defaultTeacherUsername, role: 'teacher', isEA: true });
    });
}
function testSignin(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var body = yield getAuthBody(data.username);
        if (data.isEA) {
            body.clientVersion = 65598;
        }
        var payload = JSON.parse(yield callService('signin', JSON.stringify(body)));
        assert(payload.isValid, "payload should be valid");
        assert(payload.role === data.role, `role should be ${data.role}`);
        if (data.role === 'teacher') {
            assert(payload.acceptedEula === true, `acceptedEula should be true`);
        }
    });
}
function testGetAndValidateUserGuid() {
    return __awaiter(this, void 0, void 0, function* () {
        let body1 = yield getAuthBody(defaultStudentUsername);
        body1['ipAddress'] = '1.2.3.4:404';
        let payload1 = JSON.parse(yield callService('getuserguid', JSON.stringify(body1)));
        assert(payload1.guid.length === 36, "guid should be valid");
        assert(payload1.role === 'student', `role should be student`);
        assert(payload1.tenant === defaultTenantId, `tenant id should be ${defaultTenantId}`);
        let body2 = { guid: payload1.guid };
        let payload2 = JSON.parse(yield callService('validateuserguid', JSON.stringify(body2)));
        assert(payload2.role === payload1.role, `role should be ${payload1.role}`);
        assert(payload2.tenantId === payload1.tenant, "tenant id should be correct");
        assert(payload2.ipAddress.length > 0, "ip address should be correct");
    });
}
function testSetSkin() {
    return __awaiter(this, void 0, void 0, function* () {
        let body = yield getAuthBody(defaultStudentUsername);
        body['skin'] = 'EduSkins_Forester';
        let payload = JSON.parse(yield callService('skin', JSON.stringify(body)));
        assert(payload.isValid, "set skin return should be true");
    });
}
function testAcceptEula() {
    return __awaiter(this, void 0, void 0, function* () {
        let body = yield getAuthBody(defaultTeacherUsername);
        let payload = JSON.parse(yield callService('eula', JSON.stringify(body)));
        assert(payload.isValid, "accept eula should be true");
    });
}
// Helpers ============================================================
const http = require('http');
const request = require("request");
const adal = require('adal-node');
function getTokenInfo(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        var AuthenticationContext = adal.AuthenticationContext;
        /*  function turnOnLogging() {
        var log = adal.Logging;
        log.setLoggingOptions(
        {
          level : log.LOGGING_LEVEL.VERBOSE,
          log : function(level, message, error) {
            console.log(message);
            if (error) {
              console.log(error);
            }
          }
        });
      }
    
      turnOnLogging();*/
        var authorityUrl = 'https://login.windows.net/common';
        var resource = 'https://meeservices.minecraft.net';
        var context = new AuthenticationContext(authorityUrl);
        var clientId = 'b36b1432-1a1c-4c82-9b76-24de1cab42f2';
        return new Promise(function (resolve, reject) {
            context.acquireTokenWithUsernamePassword(resource, username, password, clientId, function (err, tokenResponse) {
                if (err) {
                    reject('well that didn\'t work: ' + err.stack);
                }
                else {
                    resolve(tokenResponse);
                }
            });
        });
    });
}
function callService(path, body) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            var requestObj = {
                uri: serviceRoot + path,
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: body
            };
            request(requestObj, function (error, response, body) {
                if (!error) {
                    resolve(response.body);
                }
                else {
                    reject(error);
                }
            });
        });
    });
}
function getAuthBody(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!password) {
            password = 'pass@word1';
        }
        var tokenInfo = yield getTokenInfo(username, password);
        var identityToken = {
            test: true,
            userName: tokenInfo.userId,
            name: tokenInfo.givenName + ' ' + tokenInfo.familyName,
            oid: tokenInfo.oid,
            uniqueName: tokenInfo.userId,
            tid: tokenInfo.tenantId,
            exp: Number(new Date(tokenInfo.expiresOn))
        };
        var requestBody = {
            identityToken: JSON.stringify(identityToken),
            clientVersion: 1,
            build: 1,
            platform: "test-platform",
            osVersion: "test-osversion",
            accessToken: tokenInfo.accessToken
        };
        return requestBody;
    });
}
function assert(pass, message) {
    if (pass) {
        console.log(`  PASS: ${message}`);
    }
    else {
        console.log(`  FAIL: ${message}`);
        throw Error("test failed: " + message);
    }
}
function runTest(suite, testName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('-----------------------------');
        console.log(`${testName} Running...`);
        try {
            yield suite[testName]();
            console.log(`${testName} PASSED`);
        }
        catch (err) {
            console.log(`${testName} FAILED -> ${err}`);
        }
    });
}
function runTestSuite(testSuiteName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('=============================');
        console.log(`Running suite: ${testSuiteName}`);
        for (var testname in testSuites[testSuiteName]) {
            yield runTest(testSuites[testSuiteName], testname);
        }
        console.log(`Finished suite: ${testSuiteName}`);
        console.log('=============================');
    });
}
function runSuites() {
    return __awaiter(this, void 0, void 0, function* () {
        for (var suite of suitesToRun) {
            yield runTestSuite(suite);
        }
        process.exit();
    });
}
runSuites();
//# sourceMappingURL=basic.js.map