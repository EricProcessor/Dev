"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const http = require('http');
const request = require("request");
const adal = require('adal-node');
const uriRoot = process.env.URI || "http://localhost:1337/" || "https://meeservices-development.azurewebsites.net/";
const defaultStudentUsername = 'stu4@experienceoffice.com';
//const defaultTeachertUsername = 'teach1@experienceoffice.com';
//const defaultTeachertUsername = 'admintest1@00A5TEST12.onmicrosoft.com';
//const defaultTeacherPassword = 'P@ssword1!'
const defaultTeachertUsername = 'herby@00A5TEST12.onmicrosoft.com';
const defaultTeacherPassword = 'pass@word1';
const defaultPassword = 'pass@word1';
const defaultBusinessUsername = 'suzuha@testomsha.onmicrosoft.com';
function getTokenInfo(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        var AuthenticationContext = adal.AuthenticationContext;
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
function callService(path, jsonBody, method = 'POST', serviceRoot = uriRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            var requestObj = {
                uri: serviceRoot + path,
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonBody)
            };
            request(requestObj, (error, response) => {
                if (!error) {
                    resolve(JSON.parse(response.body));
                }
                else {
                    reject(error);
                }
            });
        });
    });
}
function getAuthBody(username, password = defaultPassword) {
    return __awaiter(this, void 0, void 0, function* () {
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
            applicationVersion: 'test-clientVer',
            displayVersion: 'test-clientVer',
            accessToken: tokenInfo.accessToken
        };
        return requestBody;
    });
}
function getUserInfo(unique_name, serviceRootStaging = uriRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        return callService(serviceRootStaging, 'getUserInfo?id=' + unique_name, undefined, 'GET')
            .then((response) => {
            chai_1.expect(response, 'getUserInfo: response').is.ok;
            chai_1.expect(response.entity[0], 'getUserInfo: response.entity').is.ok;
            return response.entity[0];
        });
    });
}
var Role;
(function (Role) {
    Role["teacher"] = "teacher";
    Role["student"] = "student";
})(Role || (Role = {}));
;
function signIn(username, role, password = defaultPassword, bodyModifier = (body) => body) {
    return __awaiter(this, void 0, void 0, function* () {
        const expectedRole = (role == Role.teacher) ? 'teacher' : 'student';
        return getAuthBody(username, password)
            .then((authBody) => {
            return callService('signin', bodyModifier(authBody));
        })
            .then((response) => {
            chai_1.expect(response).is.ok;
            return response;
        });
    });
}
describe('Test SignIn', () => {
    it('Student SignIn', (done) => {
        signIn(defaultStudentUsername, Role.student)
            .then((response) => {
            chai_1.expect(response.isValid, 'isValid').is.true;
            chai_1.expect(response.role, 'role').equals('student');
            chai_1.expect(response.signedToken, 'signedToken').is.ok;
            done();
        }).catch((reason) => done(reason));
    }).timeout(10000);
    it('Teacher SignIn', (done) => {
        signIn(defaultTeachertUsername, Role.teacher, defaultTeacherPassword)
            .then((response) => {
            chai_1.expect(response.isValid, 'isValid').is.true;
            chai_1.expect(response.role, 'role').equals('teacher');
            chai_1.expect(response.signedToken, 'signedToken').is.ok;
            done();
        }).catch((reason) => done(reason));
    }).timeout(10000);
    it('Invalid Access Token', (done) => {
        signIn(defaultTeachertUsername, Role.teacher, defaultTeacherPassword, (body) => {
            body.accessToken = '';
            return body;
        })
            .then((response) => {
            chai_1.expect(response.isValid, 'isValid').is.false;
            chai_1.expect(response.reason).is.ok;
            chai_1.expect(response.reason).contains('accessToken');
            done();
        }).catch((reason) => done(reason));
    }).timeout(10000);
});
describe('New User SignUp', () => {
    it('NewUser', (done) => {
        var token;
        done();
    });
});
describe('Test Skin', () => {
    it('setSkin', (done) => {
        var skin = 'EduSkins_Forester';
        signIn(defaultStudentUsername, Role.student)
            .then((response) => {
            chai_1.expect(response.isValid, 'isValid').is.true;
            chai_1.expect(response.skin, 'skin').is.ok;
            if (response.skin == skin) {
                skin = 'EduSkins_Alex';
            }
            return getAuthBody(defaultStudentUsername);
        })
            .then((authBody) => {
            authBody['skin'] = skin;
            return callService('skin', authBody);
        })
            .then((response) => {
            chai_1.expect(response).is.ok;
            chai_1.expect(response.isValid, 'isValid').is.true;
            return signIn(defaultStudentUsername, Role.student);
        }).then((entity) => {
            chai_1.expect(entity.skin, 'skin').is.ok;
            chai_1.expect(skin, 'skin').is.not.empty;
            chai_1.expect(entity.skin, 'entity.skin').equals(skin);
            done();
        })
            .catch((reason) => done(reason));
    }).timeout(5000);
});
//# sourceMappingURL=ServerTests.spec.js.map