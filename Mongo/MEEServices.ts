import * as Express from "./node_modules/_@types_express@4.16.0@@types/express";
import * as Request from "./node_modules/_@types_request-promise@4.1.42@@types/request-promise";

const moment = require('moment');
const request = require("request");
const azure = require("azure-storage");
const uuid = require("uuid");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

import * as Utilities from "./utilities";
import { UserID } from "./AAD";
import { getOnBehalfOfToken } from "./AAD";
import * as LicenseManager from "./LicenseManager";
import { logActivity,logActivityVerbose } from "./Logger";
import * as AzureHelper from "./AzureHelper";
import {Environment, EnvironmentType} from "./core/environment"
import { UserTable, User, UserInfo, MultiUserTable } from "./MeeUserTable";
import {SignInTelemetryTable} from "./MeeSignInTable"
import {ReceiptsTable, Receipt} from "./MeeReceiptsTable"
import { Config } from "./Config"
import {StorageConfig_mongo} from "./StorageConfig"
import {SignInResult, PopupExperience, SignInResultEarlyAccess} from "./Protocol"
import { Guid } from "./core/guid";
import { Experience } from "./Experience";
import { CheckTenancy } from "./BusinessStoreService"
//定义azure实体
const entGen = azure.TableUtilities.entityGenerator;

const privateTokenKey = getAuthPrivateKey();
const publicTokenKey = getAuthPublicKey();
//转换为小写字母
function toLowercaseList(list: string[]): string[] {
    for (let i = 0; i < list.length; ++i) {
        list[i] = list[i].toLowerCase();
    }
    return list;
}

// https://microsoft.sharepoint.com/teams/Minecraft_Education/_layouts/15/WopiFrame.aspx?sourcedoc={ec6ab83b-856e-43fb-be89-5b2c5debfbde}&action=edit&wd=target%28Customer%20Engagement%2FAllow%20List.one%7C61719734-6fe1-4b7b-a357-439d8eefcae1%2FAllow%20request%5C%2Ftracking%20list%7C58b7742e-e7ff-4868-bf67-b68bcae7041c%2F%29
// Make them all lowercase for case insensitive comparison
const allowedDomains = toLowercaseList([
    "microsoft.com",
    "minecrafteducationedition.com",
    "ambassadors.onmicrosoft.com",
    "usmie.com",
    "educationgate.school.nz",
    "msauedu01.onmicrosoft.com",
    "msauedu01.com.au",
    "msauedu02.onmicrosoft.com",
    "msauedu02.com.au",
    "mojang.com",
    "stu.marshall.kyschools.us",
    "browardschools.com",
    "nycdoestem.org",
    "windows.microsoft.com",
    "ntdev.microsoft.com",
    "mylusd.org",
    "dogakoleji.com.tr",
    "dogakoleji.com",
    "ps306bx.onmicrosoft.com",
    "PS52k.onmicrosoft.com",
    "811NYC.onmicrosoft.com",
    "nycafse.onmicrosoft.com",
    "nycpoc.onmicrosoft.com",
    "cybolyminecraft2018.onmicrosoft.com",
    "LAUSD.net",
    "mymail.lausd.net",
    "CUSDK8.ORG"
]);

// Setup environment type. LocalDevelopment storge is meant to use the local Emulator. For server development, we map it to the development storage accounts.
// Future: We should really look at applying some inversion of control concepts here. This will also help us do better testing.
//安装环境类型。LocalDevelopment storge用于使用本地模拟器。对于服务器开发，我们将其映射到开发存储帐户。
//未来：我们确实应该考虑在这里应用一些控制概念的反转。这也将帮助我们进行更好的测试。
let newUserTableSettings = StorageConfig_mongo.getNewUserTableSettings();
let userTable = new MultiUserTable(StorageConfig_mongo.getUserTableSettings(), newUserTableSettings, Config.readFromNewUserTable);

// newUserTable: Used for test paths, should switch to this when we remove the old table.
//newUserTable：用于测试路径，在删除旧表时应该切换到这个位置。
let newUserTable = new UserTable(newUserTableSettings);
let siginTelemtryTable = new SignInTelemetryTable(StorageConfig_mongo.getTelemetryTableSettings());

let receiptsTable = new ReceiptsTable(StorageConfig_mongo.getReceiptsTableSettings());

const appInsights = require("applicationinsights");
let instrumentationKey : string = process.env.APPINSIGHTS_INSTRUMENTATIONKEY ? process.env.APPINSIGHTS_INSTRUMENTATIONKEY : 'a83286f4-84b8-44ea-9f10-b05513259137';

appInsights.setup(instrumentationKey).start();
let appInsightsClient = appInsights.defaultClient;
if (!appInsightsClient) {
    const logger = console;
    process.stderr.write('Skipping app insights setup - in development mode with no ikey set\n');
    appInsightsClient =  {
            trackEvent: logger.log.bind(console, 'trackEvent'),
            trackException: logger.error.bind(console, 'trackException'),
            trackMetric: logger.log.bind(console, 'trackMetric'),
            trackDependency: logger.log.bind(console, 'trackDependency'),
        };
}
//监听异常
export function trackException(error: any) {
    appInsightsClient.trackException(new Error(error.message));
    appInsightsClient.trackEvent("exception", { content: JSON.stringify(error) });
    if (error.stacktrace) {
        appInsightsClient.trackEvent("callstack", { content: JSON.stringify(error) });
    }
}
//监听警告
export function trackWarning(error: any) {
    appInsightsClient.trackEvent("warning", { content: JSON.stringify(error) });
}
//监听事件
export function trackEvent(name: any, body: any) {
    appInsightsClient.trackEvent(name, { error: JSON.stringify(body) });
}
//监听依赖
export function trackDependency(name: string, command: string, duration: number, success: boolean) {
    appInsightsClient.trackDependency(name, command, duration, success);
}


// == 0.16+ version of signin ====================================================================

export async function signIn(res: Express.Response, user: UserID, reqBody: any): Promise<void> {

    try {
        await logActivity('server-signin', user.tenantId, user.unique_name, reqBody);
        await signTheUserIn(res, user);
    }
    catch (err) {
        trackException(err);
        await logActivity('signin-error', user.tenantId, user.unique_name, err);
        res.send(JSON.stringify({ isValid: false }));
    }
}

async function signTheUserIn(res: Express.Response, userID: UserID) {

    let isWhiteListed: boolean = (isUserInWhitelistedDomain(userID) || await isUserOnIndividualWhitelist(userID));
    let doLicenseCheck: boolean = !isWhiteListed;

    let startTime = Date.now();
    let userEntity = await userTable.get(userID);
    let duration = Date.now() - startTime;
    trackDependency("azure-storage/meeservicesstorage", "retrieveEntity", duration, true);

    let isExistingUser: boolean = userEntity.exists;
    let user = userEntity.entity;

    // TODO: Move logging to blob storage
    await logActivityVerbose('signin-azurehelper-retrieveentity', userID.tenantId, userID.unique_name, userEntity);


    // Early access users exist, but they don't have a isLicensed field. So in that case we delete them and let them get created afresh.
    // this way they get the 'new user' notification
    //早期访问用户存在，但是他们没有isLicensed字段。因此，在这种情况下，我们删除它们，并让它们重新创建。
    //通过这种方式使他们获得“新用户”通知
    if (isExistingUser && (userEntity.entity.isLicensed === undefined)) {
        await logActivityVerbose('signin-ea-removal', userID.tenantId, userID.unique_name, userEntity);
        await userTable.delete(userEntity.entity);
        isExistingUser = false;
    }

    let isLicensed: boolean = true;
    let licenseType: string;
    let lastLicenseCheck: Date;
    if (doLicenseCheck && isExistingUser && (user.isLicensed !== undefined)) {
        if (user.lastLicenseCheck !== undefined) {
            let currentTime = moment(new Date());
            let lastCheck = moment(user.lastLicenseCheck);
            if (currentTime.diff(lastCheck, 'days') < Config.licenseCacheDuration) {
                isLicensed = user.isLicensed;
                if (isLicensed) {
                    doLicenseCheck = false;
                }
            }
        }
    }

    if (doLicenseCheck) {
        userID.tenancyInfo = await CheckTenancy.CheckAccount(userID);
        
        if (userID.tenancyInfo.isEduTenant) {
            let licenseCheckResult = await LicenseManager.EnsureUserIsLicensed(userID, (isExistingUser ? user.anonimizedOid : ""));
            isLicensed = licenseCheckResult.licenseInfo.isLicensed;
            if (!licenseCheckResult.hitError) {
                lastLicenseCheck = new Date();
                if (isLicensed)
                {
                    licenseType = licenseCheckResult.licenseInfo.licenseType;
                }
            }
        }
        else {
            await logActivity('signin-not-edu-tenant', 'user not on any white list nor in edu tenancy', userID.unique_name, {});
            res.send(JSON.stringify({ isValid: false }));
            return;
        }
    }

    let role: string;
    let lastRoleCheck: Date;
    
    if (isExistingUser && (user.lastRoleCheck !== undefined)) {
        let currentTime = moment(new Date());
        let lastCheck = moment(user.lastRoleCheck);
        if (currentTime.diff(lastCheck, 'days') < Config.roleCheckCacheDuration) {
            role = user.role;
        }
    }

    if (!role) {
        role = await getUserRole(userID);        
        lastRoleCheck = new Date();
    }

    let userInfo: UserInfo;

    if (isExistingUser) {
        userInfo = await userTable.updateExistingUser(userID, user, role, lastRoleCheck, isLicensed, licenseType, lastLicenseCheck);
    }
    else {
        userInfo = await userTable.addNewUser(userID, role, isLicensed, licenseType, Guid.newGuid());
    }

    let signedToken = createSignedToken(userID);
    let clientSettings = ((userEntity.exists && user.clientSettings) ? user.clientSettings : "");

    let experience: PopupExperience = Experience.getExperience(userID, userInfo, isExistingUser);
    let result = makeSignInResult(!isExistingUser, userInfo, getMinecraftName(userID), signedToken, clientSettings, experience);
    await logActivity('signin-success', userID.tenantId, userID.unique_name, JSON.stringify(result));

    res.send(JSON.stringify(result));

    if (experience && experience.transformExperienceState != null) {
        try {
            userInfo.user.experienceState = experience.transformExperienceState(userInfo.user.experienceState);
            await userTable.storeExperienceState(userInfo.user);
        }
        catch (error) {
            trackException(error);
            await logActivity('transformexperiencestate-error', user.tenantId, user.unique_name, error);
        }
    }

    if (Config.switchToNewSigninTelemetryTable) {
        await siginTelemtryTable.recordUser(userInfo.user, !isExistingUser, isWhiteListed, userID);
    }
    else {
        await recordSigninTelemetry(userID, (!isExistingUser).toString(), isWhiteListed.toString(), isLicensed.toString(), licenseType, role, (1 + userInfo.remainingTrialCount), userInfo.user.skin);
    }
}



function isUserInWhitelistedDomain(user: UserID): boolean {
    // Make case insensitive by transforming to lowercase. allowDomains is already in lowercase.
    let domain = user.unique_name.slice(user.unique_name.lastIndexOf('@')).toLowerCase();
    for (let allowedDomain of allowedDomains) {
        if (('@' + allowedDomain) === domain) {
            return true;
        }
    }

    return false;
}

async function isUserOnIndividualWhitelist(user: UserID): Promise<boolean> {
    let allowListEntity = await AzureHelper.retrieveEntity(AzureHelper.Table.AllowList, user.unique_name, "");
    return allowListEntity.valid;
}

// == edu_earlyaccess version of signin ====================================================================

export async function signInEarlyAccess(res: Express.Response, user: UserID, reqBody: any): Promise<void> {
    try {
        await logActivity('server-signInEarlyAccess', user.tenantId, user.unique_name, reqBody);

        let userEntity = await AzureHelper.retrieveEntity(AzureHelper.Table.Users, user.tenantId, user.unique_name);
        let result: SignInResultEarlyAccess;

        if (userEntity.valid === true) {
            // user exists, so no additional checks are needed... return and succeed.
            let acceptedEula = false;
            if (userEntity.azureResult.role["_"] === "teacher") {
                acceptedEula = userEntity.azureResult.acceptedEula["_"];
            }

            result = makeSignInResultEaryAccess(
                userEntity.azureResult.role["_"],
                user,
                userEntity.azureResult.skin["_"],
                acceptedEula);

        } else {
            // User doesn't exist in the user's table. Let's see if they are on the allow list.
            let nameParts = user.unique_name.split('@');
            if (nameParts.length !== 2) {
                throw Error("unique_name didn't contain an @")
            }

            let isAllowed = isUserInWhitelistedDomain(user);
            let role = await getUserRoleEarlyAccess(user);

            if (isAllowed) {
                result = await createNewUserEarlyAccess(role, user);
            } else {
                let allowListEntity = await AzureHelper.retrieveEntity(AzureHelper.Table.AllowList, user.unique_name, "");
                if (allowListEntity.valid === false) {
                    let tenancyInfo = await CheckTenancy.CheckAccount(user);
                    if (tenancyInfo.isEduTenant === false) {
                        await logActivity('signinEarlyAccess-error', user.tenantId, user.unique_name, "Invalid tenant -- not EDU");
                        res.send(JSON.stringify({ isValid: false }));
                        return;
                    }
                }

                result = await createNewUserEarlyAccess(role, user);
            }
        }

        res.send(JSON.stringify(result));
    } catch (error) {
        trackException(error);
        await logActivity('signinEarlyAccess-error', user.tenantId, user.unique_name, error);
        res.send(JSON.stringify({ isValid: false }));
    }
}


/**
 * Signs user to classroom mode.
 * Future: There is a case, where a user signs in first time using classroom mode. An annonmized user will
 * not be created for such a user. We should look in performing a regular sign in flow for such users.
 */
export async function classroomModeSignin(res: Express.Response, userID: UserID): Promise<void> {
    try {
        let role = await getUserRole(userID);
        let returnPayload = {
            "role": role,
            "tenant": userID.tenantId
        };

        res.send(JSON.stringify(returnPayload));
        if (Config.switchToNewSigninTelemetryTable) {

            // Try and get the anonmized id.
            await userTable.get(userID).then((user) => {
                return siginTelemtryTable.recordUser(user.entity, !user.exists, undefined , userID);
            });
        }
        else {
            await recordSigninTelemetry(userID, '', '', '', '', role, -1, '');
        }
    }
    catch (err) {
        trackException(err);
        res.send(JSON.stringify({ isValid: false }));
        await logActivity('cmsignin-error', userID.tenantId, userID.unique_name, err);
    }
}

export async function registerUserGuid(res: Express.Response, user: UserID, ipAddress: string): Promise<void> {
    try {

        let guid = uuid.v4();
        let role = await getUserRole(user);

        let newEntry = {
            "PartitionKey": entGen.String(guid),
            "RowKey": entGen.String(guid),
            "tenantId": entGen.String(user.tenantId),
            "uniqueName": entGen.String(user.unique_name),
            "role": entGen.String(role),
            "ipAddress": entGen.String(ipAddress),
            "isUsed": entGen.Boolean(false)
        };

        await AzureHelper.insertEntity(AzureHelper.Table.UserGuid, newEntry);

        let returnPayload = {
            "guid": guid
        };

        res.send(JSON.stringify(returnPayload));
    }
    catch (err) {
        trackException(err);
        await logActivity('registerUserGuid-error', user.tenantId, user.unique_name, err);
        res.send(JSON.stringify({ isValid: false }));
    }
}

export async function validateUserGuid(res: Express.Response, guid: string): Promise<void> {
    try {
        let guidTableEntity = await AzureHelper.retrieveEntity(AzureHelper.Table.UserGuid, guid, guid);       
        let azResult = guidTableEntity.azureResult;

        if (azResult) {
            let timeStamp = azResult.Timestamp["_"];
            let now = Number(new Date());
            let deltaInMinutes = (now - timeStamp) / 60000;

            let isUsed = azResult.isUsed["_"];

            if (isUsed) {
                throw Error("attempt to re-use a used token");
            }

            if (deltaInMinutes > 5) {
                throw Error("guid has expired");
            }

            let returnPayload = {
                "role": azResult.role["_"],
                "tenantId": azResult.tenantId["_"],
                "ipAddress": azResult.ipAddress["_"]
            };

            res.send(JSON.stringify(returnPayload));

            azResult["isUsed"] = entGen.Boolean(true);
            await AzureHelper.updateEntity(AzureHelper.Table.UserGuid, azResult);
        }
        else {
            await logActivity('validateUserGuid-error', '#error', 'not found', guid);
            res.send(JSON.stringify({ isValid: false }));
        }
    }
    catch (err) {
        trackException(err);
        await logActivity('validateUserGuid-error', '#error', err.message, guid);
        res.send(JSON.stringify({ isValid: false }));
    }
}

export async function setSkin(res: Express.Response, user: UserID, newSkin: string): Promise<void> {
    try {
        await newUserTable.setSkin(user, newSkin);
    } catch (error) {
        trackException(error);
        await logActivity('setSkin-error', '#error', error.message, newSkin);
    } finally {
        res.send(JSON.stringify({ isValid: true }));
    }
}

export async function acceptEula(res: Express.Response, user: UserID): Promise<void> {
    try {
        await newUserTable.updateEula(user, true);
    } catch (error) {
        trackException(error);
        await logActivity('updateEula-error', '#error', error.message, undefined);
    } finally {
        res.send(JSON.stringify({ isValid: true }));
    }
}


var appleReceiptVerify = require('in-app-purchase');

export async function setReceipt(res: Express.Response, anonimizedOid: string, user: UserID, receiptString: string): Promise<void> {
    appleReceiptVerify.config({
    });

    appleReceiptVerify.setup()
        .then(() => {
            appleReceiptVerify.validateOnce(receiptString, "a858f951a77a49829af3140e2e1e8e40")
                .then(function (response) {
                    if (!appleReceiptVerify.isValidated(response)) {
                        throw new Error(`error: receipt not valid.`);
                    }

                    // valid receipt
                    var purchaseData = appleReceiptVerify.getPurchaseData(response);
                    if (purchaseData.length != 1) {
                        throw new Error(`error: expecting product length == 1.`);
                    }
            
                    if ((purchaseData[0].bundleId != "com.mojang.minecraft-edu") ||
                        (purchaseData[0].productId != "MinecraftEducationEdition")) {
                        throw new Error(`error: invalid bundleId '${purchaseData[0].bundleId}' or productId '${purchaseData[0].productId}'.`);
                    }
                                
                    let receipt : Receipt = {} as any;

                    receipt.anonimizedOid = anonimizedOid;
                    receipt.tenantId = user.tenantId;
                    receipt.transactionId = purchaseData[0].transactionId;
                    receipt.expirationDate = moment(purchaseData[0].expirationDate).toISOString();
        
                    receiptsTable.getAllWithTransactionId(receipt.transactionId).then((result) => {
                        if (result.length == 1) {
                            // receipt is bound to an existing user
                            result.forEach((val, index, arr) => {
                                if (val.anonimizedOid != anonimizedOid) {
                                    // the receipt is already bound to a different user
                                    throw new Error(`error: transactionId '${val.transactionId}' bound to anonimizedOid '${val.anonimizedOid}'.`);
                                }
                            });

                            // the receipt is bound to the current user, so we are good 
                            res.send(JSON.stringify({ isValid: true }));
                        } else if (result.length > 1) {
                            throw new Error(`error: transactionId '${result[0].transactionId}' bound to multiple anonimizedOid '${result[0].anonimizedOid}'.`);
                        }
                        else {
                            // empty array means that the receipt is not bound to a user
                            // bind the receipt to the current user
                            receiptsTable.insertOrReplace(receipt).then(function(){
                                res.send(JSON.stringify({ isValid: true }));
                            });
                        }
                    });
                })
                .catch(function (err) {
                    logActivityVerbose('appleReceiptVerify.validate', user.tenantId, user.unique_name, err.message.substring(0, 1024));
                    res.send(JSON.stringify({ isValid: false }));
                });
            })
        .catch(function (err) {
            logActivityVerbose('appleReceiptVerify.setup', user.tenantId, user.unique_name, err.message.substring(0, 1024));
            res.send(JSON.stringify({ isValid: false }));
        });
}

export async function getUserInfo(res: Express.Response, unique_name: string): Promise<void> {

    if (Environment.isProduction()) {
        res.sendStatus(403);
        return;
    }

    try {
        let entity = await newUserTable.querybyUniqueName(unique_name);
        res.send(JSON.stringify({'entity': entity}));
    }
    catch (error) {
        res.send(JSON.stringify({ "error": error.message }));
    }
}

// TODO: Move this over to userTalbe. Not sure why they pass rowkey instead of passing the partitionkey as well.
export async function deleteUser(res: Express.Response, unique_name: string): Promise<void> {

    if (Environment.isProduction()) {
       res.sendStatus(403);
      return;
    }

    try {
        let entity = await newUserTable.querybyUniqueName(unique_name);
        if (!entity || (entity.length != 1)) {
            throw new Error(`deleteUser: Found issues with entities, unsure what to delete.`);
        }
        else {
            await newUserTable.delete(entity[0]);
        }

        res.send({ "isValid": true });
    }
    catch (error) {
        res.send(JSON.stringify( { "error": error.message } ));
    }
}

export async function setTrialCounts(res: Express.Response, unique_name: string, trialsAllowed: number, trialsUsed: number): Promise<void> {

    if (Environment.isProduction()) {
        res.sendStatus(403);
        return;
    }

    try {
        let entity = await newUserTable.querybyUniqueName(unique_name);
        if (!entity || (entity.length != 1)) {
            throw new Error(`setTrialCounts: Found issues with entities, unsure what to update.`);
        }
        else {
            let userId = UserID.fromUser(entity[0]);
            await newUserTable.setTrialCounts(userId, trialsAllowed, trialsUsed);
            res.send(JSON.stringify(await newUserTable.get(userId)));
        }       
    }
    catch (error) {
        res.send(JSON.stringify({ "error": error.message }));
    }
}

export async function send404(req: Express.Request, res: Express.Response): Promise<void> {
    let headers = req.rawHeaders.join('|');
    let method = req.method;
    let url = req.originalUrl;
    let logline = `${method} ${url} [${headers}]`;
    await logActivityVerbose('http-error', "404", logline, req.body);
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
}

export async function send500(req: Express.Request, res: Express.Response, err: any): Promise<void> {
    await logActivityVerbose('http-error', "500", req.url, err);
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
}


// == HELPER FUNCTIONS ============================================================================
function makeSignInResultEaryAccess(role: string, user: UserID, skinName: string, acceptedEula: boolean): SignInResultEarlyAccess {
    //    return makeSignInResult(role, true, true, 0, user, skinName, acceptedEula, '');

    let result: SignInResultEarlyAccess = {
        isValid: true,
        trialEligible: true,                        // only used by edu_earlyaccess
        role: role,
        tenantId: user.tenantId,
        unique_name: user.unique_name,      // deprecating
        name: getMinecraftName(user),       // deprecating
        skin: skinName
    };

    if (role === "teacher") {
        result.acceptedEula = acceptedEula;
    }

    return result;
}

function makeSignInResult(isNewUser: boolean, userInfo: UserInfo, minecraftName: string, signedToken: string, clientSettings: string, popup?: PopupExperience): SignInResult {
    let user = userInfo.user;

    let userid = Config.returnAnonimizedId ? user.anonimizedOid : user.oid;

    let result: SignInResult = {
        isValid: true,
        isLicensed: user.isLicensed,
        isNewUser: isNewUser,
        trialsRemaining: userInfo.remainingTrialCount || 0,
        role: user.role,
        tenantId: user.tenantId,
        name: minecraftName,
        skin: user.skin,
        oid: userid,
        nickname: user.nickname,
        signedToken: signedToken,
        clientSettings: clientSettings,
        popup: popup
    };

    if (userInfo.user.role === "teacher") {
        result.acceptedEula = userInfo.user.acceptedEula;
    }

    return result;
}

// Return the user's name based on their "human name", if it contains ASCII characters,
// otherwise use the player's "userName" (which is either upn or email) and guaranteed to be
// made up of ASCII characters.
function getMinecraftName(user: UserID): string {
    const re = /^[_ ]+$/;
    const encodedName = encodeName(user.name);

    if (encodedName.match(re)) {
        return encodeName(user.userName);
    } else {
        return encodedName;
    }
}

function encodeName(name: string): string {
    const legalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_ ";
    let encodedName = "";

    for (let i = 0; i < name.length; ++i) {
        if (legalChars.indexOf(name[i]) >= 0) {
            encodedName += name[i];
        } else {
            encodedName += name[i] === '@' ? " " : "_";
        }
    }

    return encodedName;
}

async function createNewUserEarlyAccess(role: string, user: UserID): Promise<SignInResultEarlyAccess> {
    const defaultSkinName = "EduSkins_Alex";
    let newUser = {
        "PartitionKey": entGen.String(user.tenantId),
        "RowKey": entGen.String(user.unique_name),
        "role": entGen.String(role),
        "trialsAllowed": entGen.Int32(Config.startingTrialCountStudent),
        "trialsUsed": entGen.Int32(1),
        "tenantId": entGen.String(user.tenantId),
        "unique_name": entGen.String(user.unique_name),
        "name": entGen.String(user.name),
        "skin": entGen.String(defaultSkinName)
    };

    if (role === "teacher") {
        newUser["acceptedEula"] = entGen.Boolean(false);
        newUser["trialsAllowed"] = entGen.Int32(Config.startingTrialCountTeacher);
    }

    await AzureHelper.insertEntity(AzureHelper.Table.Users, newUser);

    return makeSignInResultEaryAccess(role, user, defaultSkinName, false);
}

async function getUserRole(user: UserID): Promise<string> {

    try {
        var success = false;
        let startTime = Date.now();

        var result = await getUserRoleRisky(user);

        let duration = Date.now() - startTime;
        success = true;
        trackDependency("portal.office.com/getUserRole", "getUserRole", duration, success);
        await logActivityVerbose('signin-getuserrole', user.tenantId, user.unique_name, "");
        
        return result;
    }
    catch(err) {
        trackWarning("role check failed: " + err);
        return await getUserRoleEarlyAccessHack(user);
    }
}

async function getUserRoleRisky(user: UserID): Promise<string> {
    let endpoint = 'https://signup.microsoft.com/';
    let accessToken = await getOnBehalfOfToken(user, endpoint);
    let uri = `${endpoint}api/signupservice/userproperties?api-version=1`;

    return new Promise<string>(function (resolve, reject) {
        try {
            request({
                uri: uri,
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'CID': uuid.v4()
                },
                body: JSON.stringify(
                    { "emailaddress": `${user.unique_name}` }
                )
            },
                function (error, response, body) {
                    try {
                        if (error) {
                            reject(error);
                        }
                        else {
                            var result = JSON.parse(body);
                            if (result.httpStatuscode === 200) {
                                let role = roleFromPersona(result.userProperties.persona);
                                resolve(role);
                            }
                            else {
                                reject(result.message);
                            }
                        }
                    }
                    catch (err) {
                        logActivity('role-check-failure', user.tenantId, user.unique_name, body);
                        throw err;
                    }
                });
        }
        catch(e) {
            reject(e);
        }
    });
}

function roleFromPersona(persona: string): string {
    /*
    Faculty - user has some Faculty license and no Student license
    Student - user has some Student license and no Faculty license
    FacultyAndStudent - user has some Faculty license and some Student license
    Unknown - user has neither Faculty nor Student license
    */
    persona = persona.toLowerCase();
    if (persona.match('faculty')) {
        return 'teacher';
    }
    else {
        return 'student';
    }
}

async function getUserRoleEarlyAccessHack(user: UserID): Promise<string> {

    let resourceId = 'https://graph.windows.net';
    let accessToken = await getOnBehalfOfToken(user, resourceId);

    return new Promise<string>(function (resolve, reject) {
        request({
            uri: `https://graph.windows.net/${user.tenantId}/users/${user.unique_name}?api-version=1.6`,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        },
            function (error, response, body) {
                const facultySkuIds = [
                    "0884d746-7b5e-4f54-befc-0e5798131c6f",
                    "c5e63e26-d3c-4f7c-8a46-ff3ccf054f91",
                    "60023c66-283d-4785-9334-1d4ca7fd3a18",
                    "fccf8ce6-0a09-4b3a-b0a8-9405a64e30a4",
                    "314bc6fe-e8af-494f-83a4-b205ee7bd0c3",
                    "dbb6dc54-c03c-4c6a-89aa-dac1bdc81653",
                    "c24b3bac-78f7-42f7-9468-97dce529d88a",
                    "0b7b15a8-7fd2-4964-bb96-5a566d4e3c15",
                    "26ad4b5c-b686-462e-84b9-d7c22b46837f",
                    "9b91265c-5630-4852-9c14-0850b29b422c",
                    "f73dabdf-ca08-41cb-b736-64280a003fe1",
                    "f63cdd48-45fb-45fe-85cc-bae5ad2a585a",
                    "55717e6e-d492-4352-991f-edb8df7a1f50",
                    "7618e501-ee4e-42a7-9051-0aab65a896e3",
                    "d1a1e918-9941-4f0c-b687-037a34dda47c",
                    "6f4a8a61-6ad8-4286-959d-06d5f5800ebe",
                    "f0c94990-c26e-4b7f-abb6-c356d67d963a",
                    "331c43a6-4410-4630-ac81-97d0623060ab",
                    "c574da5f-dc65-493f-baf6-5459a6ed44bb",
                    "d04090ac-bb3d-45f9-8485-9daff4838388",
                    "3b6ee2ce-a36d-4aed-a752-43335ecd33b5",
                    "a4585165-0533-458a-97e3-c400570268c4",
                    "9a320620-ca3d-4705-a79d-27c135c96e05",
                    "78e66a63-337a-4a9a-8959-41c6654dfb56",
                    "a19037fc-48b4-4d57-b079-ce44b7832473",
                    "94763226-9b3c-4e75-a931-5c89701abe66",
                    "e4fa3838-3d01-42df-aa28-5e0a4c68604b",
                    "16732e85-c0e3-438e-a82f-71f39cbe2acb",
                    "e30d11f7-6d8b-436a-8da8-aa6fe3f576c6",
                    "d90e9504-119a-497e-874b-37422dfed642",
                    "12b8c807-2e20-48fc-b453-542b6ee9d171",
                    "32644422-c96b-438e-9568-be950f1527a6",
                    "b2b2cb93-0896-438c-8736-4faebe5cd35a",
                    "37b1b053-55a2-4cf7-9d4c-73d1e7caf502",
                    "58e092bc-e265-4a62-b68f-ee6ed059371d",
                    "de5f128b-46d7-4cfc-b915-a89ba060ea56",
                    "ade29b5f-397e-4eb9-a287-0344bd46c68d",
                    "d7c2d530-c8d5-467d-b769-7d278b9c07bc",
                    "b732e2a7-5694-4dff-a0f2-9d9204c794ac",
                    "4075ceb4-6426-4341-a899-f6a4430f5162",
                    "763bc8b5-9f06-46c8-829c-e863ce77cda2",
                    "d456bf67-5c95-4695-b9da-83a9c77f3d8b",
                    "25e35bf2-81a6-47cf-afb2-51d976cebfb6",
                    "7e1b78f3-c708-4f07-b675-588b81858c5e",
                    "4e36995d-5cb8-430f-9028-8be8c7199ed3",
                    "d979703c-028d-4de5-acbf-7955566b69b9",
                    "c2cda955-3359-44e5-989f-852ca0cfa02f",
                    "6736d42d-f75f-4273-9cc5-75a8fbb3fdfb",
                    "b399f2ea-bf99-45b5-97fb-2742427163a9",
                    "bf95fd32-576a-4742-8d7a-6dc4940b9532"
                ];

                let role = "student";
                if (!error) {
                    let bodyText = (body as string).toLocaleLowerCase();
                    for (let skuId of facultySkuIds) {
                        if (bodyText.indexOf(skuId) >= 0) {
                            role = "teacher";
                        }
                    }
                }

                resolve(role);
            });
    });
}

async function getUserRoleEarlyAccess(user: UserID): Promise<string> {

    let resourceId = 'https://graph.windows.net';
    let accessToken = user.accessToken;

    return new Promise<string>(function (resolve, reject) {
        request({
            uri: `https://graph.windows.net/${user.tenantId}/users/${user.unique_name}?api-version=1.6`,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        },
            function (error, response, body) {
                const facultySkuIds = [
                    "0884d746-7b5e-4f54-befc-0e5798131c6f",
                    "c5e63e26-d3c-4f7c-8a46-ff3ccf054f91",
                    "60023c66-283d-4785-9334-1d4ca7fd3a18",
                    "fccf8ce6-0a09-4b3a-b0a8-9405a64e30a4",
                    "314bc6fe-e8af-494f-83a4-b205ee7bd0c3",
                    "dbb6dc54-c03c-4c6a-89aa-dac1bdc81653",
                    "c24b3bac-78f7-42f7-9468-97dce529d88a",
                    "0b7b15a8-7fd2-4964-bb96-5a566d4e3c15",
                    "26ad4b5c-b686-462e-84b9-d7c22b46837f",
                    "9b91265c-5630-4852-9c14-0850b29b422c",
                    "f73dabdf-ca08-41cb-b736-64280a003fe1",
                    "f63cdd48-45fb-45fe-85cc-bae5ad2a585a",
                    "55717e6e-d492-4352-991f-edb8df7a1f50",
                    "7618e501-ee4e-42a7-9051-0aab65a896e3",
                    "d1a1e918-9941-4f0c-b687-037a34dda47c",
                    "6f4a8a61-6ad8-4286-959d-06d5f5800ebe",
                    "f0c94990-c26e-4b7f-abb6-c356d67d963a",
                    "331c43a6-4410-4630-ac81-97d0623060ab",
                    "c574da5f-dc65-493f-baf6-5459a6ed44bb",
                    "d04090ac-bb3d-45f9-8485-9daff4838388",
                    "3b6ee2ce-a36d-4aed-a752-43335ecd33b5",
                    "a4585165-0533-458a-97e3-c400570268c4",
                    "9a320620-ca3d-4705-a79d-27c135c96e05",
                    "78e66a63-337a-4a9a-8959-41c6654dfb56",
                    "a19037fc-48b4-4d57-b079-ce44b7832473",
                    "94763226-9b3c-4e75-a931-5c89701abe66",
                    "e4fa3838-3d01-42df-aa28-5e0a4c68604b",
                    "16732e85-c0e3-438e-a82f-71f39cbe2acb",
                    "e30d11f7-6d8b-436a-8da8-aa6fe3f576c6",
                    "d90e9504-119a-497e-874b-37422dfed642",
                    "12b8c807-2e20-48fc-b453-542b6ee9d171",
                    "32644422-c96b-438e-9568-be950f1527a6",
                    "b2b2cb93-0896-438c-8736-4faebe5cd35a",
                    "37b1b053-55a2-4cf7-9d4c-73d1e7caf502",
                    "58e092bc-e265-4a62-b68f-ee6ed059371d",
                    "de5f128b-46d7-4cfc-b915-a89ba060ea56",
                    "ade29b5f-397e-4eb9-a287-0344bd46c68d",
                    "d7c2d530-c8d5-467d-b769-7d278b9c07bc",
                    "b732e2a7-5694-4dff-a0f2-9d9204c794ac",
                    "4075ceb4-6426-4341-a899-f6a4430f5162",
                    "763bc8b5-9f06-46c8-829c-e863ce77cda2",
                    "d456bf67-5c95-4695-b9da-83a9c77f3d8b",
                    "25e35bf2-81a6-47cf-afb2-51d976cebfb6",
                    "7e1b78f3-c708-4f07-b675-588b81858c5e",
                    "4e36995d-5cb8-430f-9028-8be8c7199ed3",
                    "d979703c-028d-4de5-acbf-7955566b69b9",
                    "c2cda955-3359-44e5-989f-852ca0cfa02f",
                    "6736d42d-f75f-4273-9cc5-75a8fbb3fdfb",
                    "b399f2ea-bf99-45b5-97fb-2742427163a9",
                    "bf95fd32-576a-4742-8d7a-6dc4940b9532"
                ];

                let role = "student";
                if (!error) {
                    let bodyText = (body as string).toLocaleLowerCase();
                    for (let skuId of facultySkuIds) {
                        if (bodyText.indexOf(skuId) >= 0) {
                            role = "teacher";
                        }
                    }
                }

                resolve(role);
            });
    });
}

async function recordSigninTelemetry(user: UserID, isNewUser: string, isWhiteListed:string, isLicensed: string, licenseType: string, role: string, remainingTrialCount: number, skin: string) {

    if (user.osVersion.indexOf('test') >= 0 && 
            (Environment.getEnvironmentType() == EnvironmentType.Staging) || 
            (Environment.getEnvironmentType() == EnvironmentType.Production)) {
        return;
    }

    let osPlatform = "Windows";

    if (user.osVersion.match(/macos/i)) {
        osPlatform = "macOS";
    }
    else if (user.osVersion.match(/ios/i)) {
        osPlatform = "iOS";
    }
    else if (user.osVersion.match(/android/i)) {
        osPlatform = "Android";
    }

    let dt = new Date();

    // create entity in azure user table
    let signinTelemetryEntity = {
        "PartitionKey": entGen.String(dt.toISOString().substring(0, 10)),
        "RowKey": entGen.String(uuid.v4().toString()),
        "OMSUserId": entGen.String(user.oid),
        "OMSTentantId": entGen.String(user.tenantId),
        "ClientType": entGen.String(user.clientApplication),
        "ClientVersion": entGen.String(user.clientDisplayVersion),
        "OSPlatform": entGen.String(osPlatform),
        "OSVersion": entGen.String(user.osVersion),
        "IsNewUser": entGen.String(isNewUser),
        "IsWhiteListed": entGen.String(isWhiteListed),
        "IsLicensed": entGen.String(isLicensed),
        "Role": entGen.String(role),
        "Skin": entGen.String(skin),
        "LicenseType": entGen.String(licenseType)
    };

    if (remainingTrialCount >= 0) {
        signinTelemetryEntity['RemainingTrials'] = entGen.Int32(remainingTrialCount);
    }

    await AzureHelper.insertEntity(AzureHelper.Table.SigninTelemetry, signinTelemetryEntity);
}

function getAuthPrivateKey(): string {
    let key: string = Environment.isLocalDev() ? String(fs.readFileSync('private.pem')) : process.env.PRIVATE_PEM;
    return Utilities.replacePipesWithLineFeeds(key);

}

function getAuthPublicKey(): string {
    let key: string = Environment.isLocalDev() ? String(fs.readFileSync('public.pem')) : process.env.PUBLIC_PEM;
    return Utilities.replacePipesWithLineFeeds(key);
}

function createSignedToken(user: UserID): string {
    const validNumberOfHours = 240; // 10 days
    let expiry = moment(new Date()).add(validNumberOfHours, 'h');
    let dataToSign = `${user.tenantId}|${user.oid}|${expiry.toISOString()}`;

    // Crypto returns a sign object, which is a utility for generating signatures.
    let sign = crypto.createSign('RSA-SHA256');
    sign.update(dataToSign);
    let signature = sign.sign(privateTokenKey, "hex");
    var signedToken = `${dataToSign}|${signature}`;
    return signedToken;
}
