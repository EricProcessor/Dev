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
const jwt = require('jsonwebtoken');
const fs = require('fs');
const uuid = require('uuid');
const request = require("request");
const Utilities = require("./utilities");
const Logger_1 = require("./Logger");
const MEEServices = require("./MEEServices");
const environment_1 = require("./core/environment");
class PlatformInfo {
    constructor(platform) {
        this.platform = platform;
    }
    isTouch() {
        let type = this.getType();
        return type === PlatformInfo.Type.IPad
            || type === PlatformInfo.Type.IPod
            || type === PlatformInfo.Type.IPhone
            || type === PlatformInfo.Type.IWatch;
    }
    isAnyWin32() {
        let type = this.getType();
        return type === PlatformInfo.Type.Win32
            || type === PlatformInfo.Type.Win32Centennial;
    }
    getType() {
        let checks = {
            '(Centennial)': PlatformInfo.Type.Win32Centennial,
            '(Win32)': PlatformInfo.Type.Win32,
            'UWP': PlatformInfo.Type.UWP,
            'iPhone': PlatformInfo.Type.IPhone,
            'iPad': PlatformInfo.Type.IPad,
            'iPod': PlatformInfo.Type.IPod,
            'Watch': PlatformInfo.Type.IWatch,
        };
        // Try to find any of the above keys in the platform string and return the first result
        for (let key in checks) {
            if (this.platform.indexOf(key) >= 0) {
                return checks[key];
            }
        }
        return PlatformInfo.Type.Unknown;
    }
}
// Used to distinguish between platform differences among requests sent with the same osVersion field.
// The strings are put in user telemetry, so don't change them without good reason.
PlatformInfo.Type = {
    Unknown: '',
    Win32: 'Win32 Msi',
    Win32Centennial: 'Win32 Centennial',
    UWP: 'UWP',
    IPad: 'iPad',
    IPod: 'iPod',
    IPhone: 'iPhone',
    IWatch: 'Apple Watch',
};
exports.PlatformInfo = PlatformInfo;
class UserID {
    constructor(tenantId, unique_name, // this ID is what we use in storage -- it's lifetime unique
    userName, // this ID is their UPN or EMAIL -- unique within AAD right now, but not lifetime unique
    name, // this is their "human name"
    oid, // this is their immutable guid
    accessToken, // the user's access token to use for Graph calls
    clientApplication, clientDisplayVersion, osVersion, tenancyInfo, platform, locale) {
        this.tenantId = tenantId;
        this.unique_name = unique_name;
        this.userName = userName;
        this.name = name;
        this.oid = oid;
        this.accessToken = accessToken;
        this.clientApplication = clientApplication;
        this.clientDisplayVersion = clientDisplayVersion;
        this.osVersion = osVersion;
        this.tenancyInfo = tenancyInfo;
        this.platform = platform;
        this.locale = locale;
    }
    getPlatformInfo() {
        return new PlatformInfo(this.platform != null ? this.platform : '');
    }
    static fromUser(user) {
        let userID = {};
        userID.tenantId = user.tenantId;
        userID.unique_name = user.unique_name;
        userID.oid = user.oid;
        return userID;
    }
}
exports.UserID = UserID;
function getOnBehalfOfToken(user, requestedAudience) {
    return __awaiter(this, void 0, void 0, function* () {
        let tenantId = user.tenantId;
        //let requestURLTemplate = "https://login.windows.net/{tenant-id}/oauth2/token";
        let requestURLTemplate = "https://oauth2.jdcloud.com/authorize?client_id={tenant-id}/&redirect_uri=https://www.jdcloud.com&response_type=token&scope=openid";
        let requestURL = requestURLTemplate
            .replace("{tenant-id}", encodeURIComponent(tenantId));
        //const meeServiceAppId = "16556bfc-5102-43c9-a82a-3ea5e4810689";
        const meeServiceAppId = "9561544065616502";
        let grantType = "urn:ietf:params:oauth:grant-type:jwt-bearer";
        let tokenUse = "on_behalf_of";
        let apiClientId = meeServiceAppId;
        let clientAssertionType = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
        let requestBodyTemplate = "resource={resource}" +
            "&grant_type={grant-type}" +
            "&requested_token_use={token-use}" +
            "&assertion={access-token}" +
            "&client_id={api-client-id}" +
            "&client_assertion_type={client-assertion-type}" +
            "&client_assertion={client-assertion}";
        var privateCert = getCertPrivateKey();
        var thumbprint = getCertThumbprint();
        let now = Math.floor(Date.now() / 1000);
        let claims = {
            iss: apiClientId,
            sub: apiClientId,
            jti: uuid.v1(),
            aud: requestURL,
            iat: now,
            nbf: now - 15,
            exp: now + 60
        };
        try {
            var clientAssertion = jwt.sign(claims, privateCert, { algorithm: 'RS256', 'header': { 'x5t': thumbprint } });
        }
        catch (error) {
            yield Logger_1.logActivity('key3', '', '', error.stack);
        }
        let requestBody = requestBodyTemplate
            .replace("{resource}", encodeURIComponent(requestedAudience))
            .replace("{grant-type}", encodeURIComponent(grantType))
            .replace("{token-use}", encodeURIComponent(tokenUse))
            .replace("{access-token}", encodeURIComponent(user.accessToken))
            .replace("{api-client-id}", encodeURIComponent(apiClientId))
            .replace("{client-assertion-type}", encodeURIComponent(clientAssertionType))
            .replace("{client-assertion}", encodeURIComponent(clientAssertion));
        return new Promise(function (resolve, reject) {
            try {
                var success = false;
                let startTime = Date.now();
                request({
                    uri: requestURL,
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: requestBody
                }, function (error, response, body) {
                    let duration = Date.now() - startTime;
                    success = true;
                    MEEServices.trackDependency("graph", "getOnBehalfOfToken", duration, success);
                    if (!error) {
                        let bodyObj = JSON.parse(body);
                        if (bodyObj.error) {
                            reject(bodyObj.error + ' ' + bodyObj.error_description);
                        }
                        else {
                            resolve(bodyObj.access_token);
                        }
                    }
                    else {
                        reject(error);
                    }
                });
            }
            catch (err) {
                MEEServices.trackWarning("behalfof token get failure: " + err);
                reject(err);
            }
        });
    });
}
exports.getOnBehalfOfToken = getOnBehalfOfToken;
function getCertThumbprint() {
    if (environment_1.Environment.isProduction() || environment_1.Environment.isStaging()) {
        return process.env.CERT_THUMBPRINT;
    }
    else {
        return '2kk5TTTNNtWi6Q0bFbI3g3PLCI0=';
    }
}
function getCertPrivateKey() {
    let key = environment_1.Environment.isLocalDev() ? String(fs.readFileSync('server.key')) : process.env.CERT_PRIVATE_KEY;
    return Utilities.replacePipesWithLineFeeds(key);
}
//# sourceMappingURL=AAD.js.map