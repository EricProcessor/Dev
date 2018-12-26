import {expect} from 'chai'
import { resolve } from 'url';

const http = require('http');
const request = require("request");
const adal = require('adal-node');

const uriRoot = process.env.URI || "http://localhost:1337/" || "https://meeservices-development.azurewebsites.net/"
const defaultStudentUsername = 'stu4@experienceoffice.com';
//const defaultTeachertUsername = 'teach1@experienceoffice.com';
//const defaultTeachertUsername = 'admintest1@00A5TEST12.onmicrosoft.com';
//const defaultTeacherPassword = 'P@ssword1!'
const defaultTeachertUsername = 'herby@00A5TEST12.onmicrosoft.com';
const defaultTeacherPassword = 'pass@word1';
const defaultPassword = 'pass@word1';
const defaultBusinessUsername = 'suzuha@testomsha.onmicrosoft.com';

async function getTokenInfo(username: string, password: string) {
    var AuthenticationContext = adal.AuthenticationContext;
  
    var authorityUrl = 'https://login.windows.net/common';
    var resource = 'https://meeservices.minecraft.net';
    var context = new AuthenticationContext(authorityUrl);
    var clientId = 'b36b1432-1a1c-4c82-9b76-24de1cab42f2';
  
    return new Promise<any>(function (resolve, reject) {  
        context.acquireTokenWithUsernamePassword(resource, username, password, clientId, function(err, tokenResponse) {
          if (err) {
              reject('well that didn\'t work: ' + err.stack);
          } else {
              resolve(tokenResponse);
          }
      });
    });
}
  
async function callService(path: string, jsonBody: any, method: string = 'POST', serviceRoot: string = uriRoot) {

    return new Promise<any>(function (resolve, reject) {

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
                } else {
                    reject(error);
                }
            }
        );
    });
}

async function getAuthBody(username: string, password: string = defaultPassword) {
    var tokenInfo = await getTokenInfo(username, password);

    var identityToken = {
        test: true,
        userName: tokenInfo.userId,
        name: tokenInfo.givenName + ' ' + tokenInfo.familyName,
        oid: tokenInfo.oid,
        uniqueName: tokenInfo.userId,
        tid: tokenInfo.tenantId,
        exp: Number(new Date(tokenInfo.expiresOn))
    }

    var requestBody = {
        identityToken: JSON.stringify(identityToken),
        clientVersion: 1,
        build: 1,
        platform: "test-platform",
        osVersion: "test-osversion",
        applicationVersion: 'test-clientVer',
        displayVersion: 'test-clientVer',
        accessToken: tokenInfo.accessToken
    }

    return requestBody;
}

async function getUserInfo(unique_name:string, serviceRootStaging:string = uriRoot ) {
    return callService(serviceRootStaging, 'getUserInfo?id=' + unique_name, undefined, 'GET')
        .then((response) => {
            expect(response, 'getUserInfo: response').is.ok;
            expect(response.entity[0], 'getUserInfo: response.entity').is.ok;
            return response.entity[0]}) ;
}

enum Role {
    teacher = 'teacher',
    student = 'student'
};

async function signIn(username: string, role: Role, password: string = defaultPassword , bodyModifier: (body: any) => any = (body) => body) {
    const expectedRole: string = (role == Role.teacher) ? 'teacher' : 'student';
    return getAuthBody(username, password)
            .then((authBody) => {
                return callService('signin', bodyModifier(authBody));
            })
            .then((response) => {
                expect(response).is.ok;
                return response;
            });
}

describe('Test SignIn', () => {
    it('Student SignIn', (done) => {
        signIn(defaultStudentUsername, Role.student)
        .then((response) => {
            expect(response.isValid, 'isValid').is.true;
            expect(response.role, 'role').equals('student');
            expect(response.signedToken, 'signedToken').is.ok;
            done();
        }).catch((reason) => done(reason));
    }).timeout(10000);

    it('Teacher SignIn', (done) => {
        signIn(defaultTeachertUsername, Role.teacher, defaultTeacherPassword)
        .then((response) => {
            expect(response.isValid, 'isValid').is.true;
            expect(response.role, 'role').equals('teacher');
            expect(response.signedToken, 'signedToken').is.ok;
            done();
        }).catch((reason) => done(reason));
    }).timeout(10000);

    it('Invalid Access Token', (done) => {
        signIn(defaultTeachertUsername, Role.teacher, 
            defaultTeacherPassword,
            (body) => {
                body.accessToken = '';
                return body;
            })
        .then((response) => {
            expect(response.isValid, 'isValid').is.false;
            expect(response.reason).is.ok;
            expect(response.reason).contains('accessToken');
            done();
        }).catch((reason) => done(reason));
    }).timeout(10000);
});

describe('New User SignUp', () => {
    it('NewUser', (done) => {
        var token: any;
        done();
    });
});

describe('Test Skin', () => {
    it('setSkin', (done) => {
        var skin: string  = 'EduSkins_Forester';
        signIn(defaultStudentUsername, Role.student)
        .then((response) => {
            expect(response.isValid, 'isValid').is.true;
            expect(response.skin, 'skin').is.ok;
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
            expect(response).is.ok;
            expect(response.isValid, 'isValid').is.true;
            return signIn(defaultStudentUsername, Role.student);
        }).then((entity) => {
            expect(entity.skin, 'skin').is.ok;
            expect(skin, 'skin').is.not.empty;
            expect(entity.skin,'entity.skin').equals(skin);
            done();
        })
        .catch((reason) => done(reason));
    }).timeout(5000);
});