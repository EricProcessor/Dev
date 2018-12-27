import * as AzureHelper from "../AzureHelper";
import * as LicenseManager from "../LicenseManager";
import { Config } from "../Config";
import { EnvironmentType } from "../core/environment";
import { Experience } from "../Experience";
import { User, UserInfo } from '../MeeUserTable'
import { UserID, PlatformInfo } from "../AAD";
import { PopupExperience } from "../Protocol";
const defaultStudentUsername = 'stu4@experienceoffice.com';
const defaultTeacherUsername = 'teach1@experienceoffice.com';
const defaultTenantId = '38dd6634-1031-4c50-a9b4-d16cd9d97d57';
const defaultBusinessUsername = 'suzuha@testomsha.onmicrosoft.com';
const serviceRootLocalDevelopment = "http://localhost:1337/";
const serviceRootDevelopment = "https://meeservices-development.azurewebsites.net/"
const serviceRootStaging = "https://meeservices-staging.azurewebsites.net/"
const serviceRootProduction = "https://meeservices.azurewebsites.net/"
let serviceRoot = serviceRootLocalDevelopment;
const moment = require('moment');

if (process.argv.length === 3) {
    let targetEnv = process.argv[2].toLowerCase();

    if (targetEnv.match('development')) {
        serviceRoot = serviceRootDevelopment;
        Config.environmentOverride = EnvironmentType.Development;
        
    }
    if (targetEnv.match('staging')) {
        serviceRoot = serviceRootStaging;
        Config.environmentOverride = EnvironmentType.Staging;
    }
    else if (targetEnv.match('production')) {
        serviceRoot = serviceRootProduction;
        Config.environmentOverride = EnvironmentType.Production;
    }
}

console.log(`Running tests against: ${serviceRoot} ...`);

let suitesToRun = [ 'suiteBasic' ];
//let suitesToRun = [ 'suiteExperimental' ];

// Test Groupings ============================================================

let suiteBasic = {
    testSigninStudent,
    testSigninTeacher,
    testCMSignin,
    testGetAndValidateUserGuid,
    testSetSkin,
    testDeleteUser,
    testAcceptEula,
    testSigninEAFails,
    testSigninBetaFails,
    testSigninEvaluationFails,
    testSigninNoBodyFails,
    testSigninNoAccessTokenFails,
    testSigninBusiness,
    testPlanAssignment,
    testSetClientSettings,
    testExperienceBetaWelcome,
    testExperienceCSStudentKeyboard,
    testExperienceCSStudentTouch,
    testExperienceCSTeacherKeyboard,
    testExperienceCSTeacherTouch,
    testExperienceCSTeacherTouchPhone,
    testExperienceCSOnlyShowsOnce,
    testExperienceCSOnlyEnglish,
    testExperienceCSNotBeforeDate,
    testPlatformInfo,
}

let suiteExperimental = {
        testAcceptEula,
}

let testSuites = {
    suiteBasic: suiteBasic,
    suiteExperimental: suiteExperimental,
}

// Tests ============================================================

async function testSigninStudent() {
    await testSignin({ username: defaultStudentUsername, role: 'student' });
}

async function testSigninTeacher() {
    await testSignin({ username: defaultTeacherUsername, role: 'teacher' });
}

async function testSigninStudentEA() {
    await testSignin({ username: defaultStudentUsername, role: 'student', isEA: true });
}

async function testSigninTeacherEA() {
    await testSignin({ username: defaultTeacherUsername, role: 'teacher', isEA: true });
}

async function testSignin(data: any)  {
    var body = await getAuthBody(data.username);
    if (data.isEA) {
        body.clientVersion = 65598;
    }

    var payload = JSON.parse(await callService('signin', JSON.stringify(body)));
    assert(payload.isValid, "payload should be valid");
    assert(payload.role === data.role, `role should be ${data.role}`);
    if (data.role === 'teacher') {
        assert(payload.acceptedEula === true, `acceptedEula should be true`);
    }
    assert(payload.signedToken !== null, "signedToken shouldn't be null");
}

async function testSigninEAFails() {
    var body = await getAuthBody(defaultTeacherUsername);
    body.clientVersion = 65598;
    var payload = JSON.parse(await callService('signin', JSON.stringify(body)));

    assert(!payload.isValid, "payload should be invalid");
    assert(payload.reason === 'Invalid client - edu_earlyaccess', `reason should be due to edu_earlyaccess`);
}

async function testSigninBetaFails() {
    var body = await getAuthBody(defaultTeacherUsername);
    body.clientVersion = 110;
    var payload = JSON.parse(await callService('signin', JSON.stringify(body)));

    assert(!payload.isValid, "payload should be invalid");
    assert(payload.reason === 'Invalid client - codebuilder_beta', `reason should be due to codebuilder_beta`);
}

async function testSigninEvaluationFails() {
    var body = await getAuthBody(defaultTeacherUsername);
    body.clientVersion = 65596;
    var payload = JSON.parse(await callService('signin', JSON.stringify(body)));

    assert(!payload.isValid, "payload should be invalid");
    assert(payload.reason === 'Invalid client - edu_evaluation', `reason should be due to edu_evaluation`);
}

async function testSigninNoBodyFails() {
    var body = {};
    var payload = JSON.parse(await callService('signin', JSON.stringify(body)));

    assert(!payload.isValid, "payload should be invalid");
    assert(payload.reason === 'Invalid post data - no body and client version', `reason should be due to empty body`);
}

async function testSigninNoAccessTokenFails() {
    var body = await getAuthBody(defaultTeacherUsername);
    body.accessToken = '';
    var payload = JSON.parse(await callService('signin', JSON.stringify(body)));

    assert(!payload.isValid, "payload should be invalid");
    assert(payload.reason === 'Invalid post data: accessToken', `reason should be due to empty body`);
}

async function testSigninBusiness() {
    var body = await getAuthBody(defaultBusinessUsername);
    var payload = JSON.parse(await callService('signin', JSON.stringify(body)));
    assert(!payload.isValid, "payload should be invalid because user is from a business tenant");
}

async function testGetAndValidateUserGuid()  {
    let body1 = await getAuthBody(defaultStudentUsername);
    body1['ipAddress'] = '1.2.3.4:404';
    let payload1 = JSON.parse(await callService('getuserguid', JSON.stringify(body1)));
    assert(payload1.guid.length === 36, "guid should be valid");

    let body2 = { guid: payload1.guid };
    let payload2 = JSON.parse(await callService('validateuserguid', JSON.stringify(body2)));
    assert(payload2.role === 'student', `role should be student`);
    assert(payload2.tenantId  === defaultTenantId, "tenant id should be correct");
    assert(payload2.ipAddress.length > 0, "ip address should be correct");
}

async function testCMSignin() {
    let body = await getAuthBody(defaultTeacherUsername);
    let payload = JSON.parse(await callService('cmsignin', JSON.stringify(body)));
    assert(payload.role === 'teacher', `role should be teacher`);
    assert(payload.tenant === defaultTenantId, `tenant id should be ${defaultTenantId}`);
}

async function testSetSkin() {
    let body = await getAuthBody(defaultStudentUsername);
    body['skin'] = 'EduSkins_Forester';
    let payload = JSON.parse(await callService('skin', JSON.stringify(body)));
    assert(payload.isValid, "set skin return should be true");
 }

 async function testSetClientSettings() {
    let body = await getAuthBody(defaultStudentUsername);
    body['clientSettings'] = '{test: settings}';
    let payload = JSON.parse(await callService('clientsettings', JSON.stringify(body)));
    assert(payload.isValid, "set clientsettings return should be true");
 }

async function testAcceptEula() {
    let body = await getAuthBody(defaultTeacherUsername);
    let payload = JSON.parse(await callService('eula', JSON.stringify(body)));
    assert(payload.isValid, "accept eula should be true");
}

async function testDeleteUser() {

    // if target for testing is production, this won't work.
    // because this test process is run locally on a dev box. As AzureHerlper says ('this process isn't production, so we'll us staging table')

    let entity = await AzureHelper.queryEntityRowKey(AzureHelper.Table.Users, defaultStudentUsername);
    await AzureHelper.deleteEntity(AzureHelper.Table.Users, entity);

    let entity2 = await AzureHelper.queryEntityRowKey(AzureHelper.Table.Users, defaultStudentUsername);
    assert(entity2.length == 0, "user should be deleted");
}


async function testPlanAssignment() {
    let vlPlan = "{\"assignedPlans\": [{\"assignedDateTime\": \"2018-01-10T07:24:45Z\", \"capabilityStatus\": \"Enabled\",\"service\": \"MinecraftEducationEditionServices\",\"servicePlanId\": \"4c246bbc-f513-4311-beff-eba54c353256\"}]}";
    let directPlan = "{\"assignedPlans\": [{\"assignedDateTime\": \"2018-01-10T07:24:45Z\", \"capabilityStatus\": \"Enabled\",\"service\": \"MinecraftEducationEditionServices\",\"servicePlanId\": \"35973fbf-367b-49c4-aca4-717817774146\"}]}";
    let noPlan = "{\"assignedPlans\": [{\"assignedDateTime\": \"2018-01-10T07:24:45Z\", \"capabilityStatus\": \"Enabled\",\"service\": \"NoPlan\",\"servicePlanId\": \"12345678-1234-1234-1234-123456789012\"}]}";
    let disabledPlan = "{\"assignedPlans\": [{\"assignedDateTime\": \"2018-01-10T07:24:45Z\", \"capabilityStatus\": \"Disabled\",\"service\": \"MinecraftEducationEditionServices\",\"servicePlanId\": \"35973fbf-367b-49c4-aca4-717817774146\"}]}";
    let bothEnabledPlan = "{\"assignedPlans\": [{\"assignedDateTime\": \"2018-01-10T07:24:45Z\", \"capabilityStatus\": \"Enabled\",\"service\": \"MinecraftEducationEditionServices\",\"servicePlanId\": \"35973fbf-367b-49c4-aca4-717817774146\"},\
                                                {\"assignedDateTime\": \"2018-01-10T07:24:45Z\", \"capabilityStatus\": \"Enabled\",\"service\": \"MinecraftEducationEditionServices\",\"servicePlanId\": \"4c246bbc-f513-4311-beff-eba54c353256\"}]}";
    let oneEnabledPlan = "{\"assignedPlans\": [{\"assignedDateTime\": \"2018-01-10T07:24:45Z\", \"capabilityStatus\": \"Enabled\",\"service\": \"NoPlan\",\"servicePlanId\": \"12345678-1234-1234-1234-123456789012\"},\
                                               {\"assignedDateTime\": \"2018-01-10T07:24:45Z\", \"capabilityStatus\": \"Enabled\",\"service\": \"MinecraftEducationEditionServices\",\"servicePlanId\": \"4c246bbc-f513-4311-beff-eba54c353256\"}]}";

    assert(LicenseManager.HasEnabledPlan(vlPlan).enabled, "VL plan should be enabled");
    assert(LicenseManager.HasEnabledPlan(directPlan).enabled, "Direct plan should be enabled");
    assert(!LicenseManager.HasEnabledPlan(noPlan).enabled, "No plan should be enabled");
    assert(!LicenseManager.HasEnabledPlan(disabledPlan).enabled, "Plan should be disabled");
    assert(LicenseManager.HasEnabledPlan(bothEnabledPlan).enabled, "Both plans should be enabled");
    assert(LicenseManager.HasEnabledPlan(oneEnabledPlan).enabled, "One plan should be enabled");
}

async function testExperienceCSTeacherTouch() {
    // Here's a list of what these can look like: https://gist.github.com/adamawolf/3048717
    let experience: PopupExperience = getExperienceWithPlatformAndRole('iPad7,3 : iPad Pro 10.5-inch', 'teacher');
    assert(experience == null, "shouldn't show notification for touch");
}

async function testExperienceCSTeacherTouchPhone() {
    let experience: PopupExperience = getExperienceWithPlatformAndRole('iPhone10,3', 'teacher');
    assert(experience == null, "shouldn't show notification for touch");
}

async function testExperienceCSTeacherKeyboard() {
    let experience: PopupExperience = getExperienceWithPlatformAndRole('Windows Desktop Build (Win32)', 'teacher');
    assert(experience && experience.id == "5c466b18-7982-4b90-9a20-94901f33c2b7", "win32 teacher should result in teacher keyboard cs experience");
}

async function testExperienceCSStudentTouch() {
    let experience: PopupExperience = getExperienceWithPlatformAndRole('iPad7,3 : iPad Pro 10.5-inch', 'student');
    assert(experience == null, "shouldn't show notification for touch");
}

async function testExperienceCSStudentKeyboard() {
    let experience: PopupExperience = getExperienceWithPlatformAndRole('Windows Desktop Build (Win32)', 'student');
    assert(experience && experience.id == "2e81d886-1054-4d74-a2a4-452bf5607e5c", "win32 student should result in student keyboard cs experience");
}

async function testExperienceCSOnlyShowsOnce() {
    let [ userId, userInfo ] = createValidUserIdAndInfo();

    let firstExperience: PopupExperience = Experience.getExperience(userId, userInfo, true, getCSDate());

    userInfo.user.experienceState = firstExperience.transformExperienceState(userInfo.user.experienceState);

    let secondExperience: PopupExperience = Experience.getExperience(userId, userInfo, true, getCSDate());

    assert(secondExperience == null, "cs experience should only show once");
}

async function testExperienceCSOnlyEnglish() {
    let [ userId, userInfo ] = createValidUserIdAndInfo();
    userId.locale = 'fr';

    let experience: PopupExperience = Experience.getExperience(userId, userInfo, true, getCSDate());

    assert(experience == null, 'CS experience is only supposed to appear for english locales');
}

async function testExperienceCSNotBeforeDate() {
    let [ userId, userInfo ] = createValidUserIdAndInfo();

    let experience: PopupExperience = Experience.getExperience(userId, userInfo, true, getBeforeCSDate());

    assert(experience == null, 'CS experience is only supposed to appear after specified date');
}

async function testExperienceBetaWelcome() {
    let [ userId, userInfo ] = createValidUserIdAndInfo();
    userId.clientDisplayVersion = '1.6.0';
    userId.clientApplication = 'Minecraft';
    userId.platform = 'Windows Desktop Build (Win32)';

    let experience: PopupExperience = Experience.getExperience(userId, userInfo, true);

    assert(experience && experience.id == '15d6cfc2-6418-4e1d-9910-fce5dbf61c8a', 'Win32 user of 1.6.0 should get beta welcome message');
}

async function testPlatformInfo() {
    let platforms = {
        'Windows Desktop Build (Win32)': PlatformInfo.Type.Win32,
        'Windows Desktop Build (Centennial)': PlatformInfo.Type.Win32Centennial,
        'Windows 10 UWP Build': PlatformInfo.Type.UWP,
        'iPhone10,3': PlatformInfo.Type.IPhone,
        'iPod7,1': PlatformInfo.Type.IPod,
        'iPad8,8': PlatformInfo.Type.IPad,
        'Watch4,4': PlatformInfo.Type.IWatch,
    }
    for (let platformString in platforms) {
        assert(new PlatformInfo(platformString).getType() === platforms[platformString], `${platformString} should map to ${platforms[platformString]}`);
    }
}

function getCSDate(): Date {
    return new Date(Date.UTC(2018, 11, 2));
}

function getBeforeCSDate(): Date {
    return new Date(Date.UTC(2018, 11, 1));
}

function createValidUserIdAndInfo(): [ UserID, UserInfo ] {
    let userId = new UserID('', '', '', '', '', '');
    let userInfo: UserInfo = createUserInfoWithRole('teacher');
    userId.platform = 'Windows Desktop Build (Win32)';
    userId.locale = 'en';
    return [ userId, userInfo ];
}

function createUserInfoWithRole(role: string): UserInfo {
    return {
        remainingTrialCount: 5,
        user: {
            role: role,
        } as User
    } as UserInfo;
}

function getExperienceWithPlatformAndRole(platform: string, role: string): PopupExperience {
    let [ userId, userInfo ] = createValidUserIdAndInfo();
    userId.platform = platform;
    userInfo.user.role = role;

    return Experience.getExperience(userId, userInfo, true, getCSDate());
}

// Helpers ============================================================

const http = require('http');
const request = require("request");
const adal = require('adal-node');

async function getTokenInfo(username: string, password: string) {


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

async function callService(path: string, body: string) {

    return new Promise<string>(function (resolve, reject) {

        var requestObj = {
            uri: serviceRoot + path,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body
        };

        request(requestObj,
            function (error, response, body) {
                if (!error) {
                    resolve(response.body);
                } else {
                    reject(error);
                }
            }
        );
    });
}

async function getAuthBody(username: string, password?: string) {

    if (!password) {
        password = 'pass@word1';
    }
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

function assert(pass: boolean, message: string) {
    if (pass) {
        console.log(`  PASS: ${message}`);
    }
    else {
        console.log(`  FAIL: ${message}`);
        throw Error("test failed: " + message);
    }
}

async function runTest(suite, testName: string) {
    console.log('-----------------------------');
    console.log(`${testName} Running...`);

    let passedCount = 0;
    let failureCount = 0;

    try {
        await suite[testName]();
        console.log(`${testName} PASSED`);
        passedCount++;
    }
    catch (err) {
        console.log(`${testName} FAILED -> ${err}`);
        failureCount++
    }

    return [ passedCount, failureCount ];
}

async function runTestSuite(testSuiteName) {
    console.log('=============================');
    console.log(`Running suite: ${testSuiteName}`);

    let totalPassCount = 0;
    let totalFailureCount = 0;
    for (var testname in testSuites[testSuiteName]) {
        let t = await runTest(testSuites[testSuiteName], testname);
        totalPassCount += t[0];
        totalFailureCount += t[1];
    }

    let result = totalFailureCount == 0 ? 'PASS' : 'FAIL';
    console.log(`Passed: ${totalPassCount}`);
    console.log(`Failed: ${totalFailureCount}`);
    console.log(`Finished suite: ${testSuiteName} (${result}) @ ${moment(Date.now()).format()}`);
    console.log('=============================');
}

async function runSuites() {
    for(var suite of suitesToRun) {
        await runTestSuite(suite);
    }

    process.exit();
}

runSuites();