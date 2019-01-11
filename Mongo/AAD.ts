//jwt一种实现服务器与客服端安全通讯的一种规范方案,可以实现安全的加密方案
const jwt = require('jsonwebtoken');
//fs模块是文件系统模块，负责读写文件
const fs = require('fs');
//用来生成随机字符串
const uuid = require('uuid');
//用于发送http请求
const request = require("request");
import * as Utilities from "./utilities";
import { logActivity } from "./Logger";
import * as MEEServices from "./MEEServices";
import {Environment} from "./core/environment"
import { User } from "./MeeUserTable";
import { TenancyInfo } from "./BusinessStoreService";

//平台信息
export class PlatformInfo {
    // Used to distinguish between platform differences among requests sent with the same osVersion field.
    // The strings are put in user telemetry, so don't change them without good reason.
    //用于区分使用同一操作系统发送的请求之间的平台差异。
    //字符串是用户遥测的，所以没有充分理由不要更改它们。
    static Type = {
        Unknown: '',
        Win32: 'Win32 Msi',
        Win32Centennial: 'Win32 Centennial',
        UWP: 'UWP',
        IPad: 'iPad',
        IPod: 'iPod',
        IPhone: 'iPhone',
        IWatch: 'Apple Watch',
    }

    constructor(public platform: string) {
    }

    isTouch(): boolean {
        let type: string = this.getType();
        return type === PlatformInfo.Type.IPad
            || type === PlatformInfo.Type.IPod
            || type === PlatformInfo.Type.IPhone
            || type === PlatformInfo.Type.IWatch;
    }

    isAnyWin32(): boolean {
        let type: string = this.getType();
        return type === PlatformInfo.Type.Win32
            || type === PlatformInfo.Type.Win32Centennial;
    }

    getType(): string {
        let checks = {
            '(Centennial)': PlatformInfo.Type.Win32Centennial,
            '(Win32)': PlatformInfo.Type.Win32,
            'UWP': PlatformInfo.Type.UWP,
            'iPhone': PlatformInfo.Type.IPhone,
            'iPad': PlatformInfo.Type.IPad,
            'iPod': PlatformInfo.Type.IPod,
            'Watch': PlatformInfo.Type.IWatch,
        }

        // Try to find any of the above keys in the platform string and return the first result
        for (let key in checks) {
            if (this.platform.indexOf(key) >= 0) {
                return checks[key];
            }
        }
        return PlatformInfo.Type.Unknown;
    }
}

export class UserID {
    constructor(
        public tenantId: string,
        public unique_name: string,     // this ID is what we use in storage -- it's lifetime unique
        public userName: string,        // this ID is their UPN or EMAIL -- unique within AAD right now, but not lifetime unique
        public name: string,            // this is their "human name"
        public oid: string,            // this is their immutable guid
        public accessToken: string,     // the user's access token to use for Graph calls
        public clientApplication?: string,
        public clientDisplayVersion?: string,
        public osVersion?: string,
        public tenancyInfo?: TenancyInfo,
        public platform?: string,
        public locale?: string)
    {
    }
    //获取平台信息
    getPlatformInfo(): PlatformInfo {
        return new PlatformInfo(this.platform != null ? this.platform : '');
    }

    static fromUser(user: User) : UserID {
        let userID : UserID = {} as any;
        userID.tenantId = user.tenantId;
        userID.unique_name = user.unique_name;
        userID.oid = user.oid;
        return userID;
    }
}

export interface OnBehalfOfToken {
    token_type: string;
    scope: string;
    expires_in: string;
}
//获取token令牌
export async function getOnBehalfOfToken(user: UserID, requestedAudience: string): Promise<string> {

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
        jti: uuid.v1(), //根据时间戳生成随机uuid
        aud: requestURL,
        iat: now,
        nbf: now - 15,
        exp: now + 60
    };
    try {
        //jwt.sign 生成token
        var clientAssertion = jwt.sign(claims, privateCert, { algorithm: 'RS256', 'header': { 'x5t': thumbprint } });
    }
    catch (error) {
        await logActivity('key3', '', '', error.stack);
    }

    let requestBody = requestBodyTemplate
        .replace("{resource}", encodeURIComponent(requestedAudience))
        .replace("{grant-type}", encodeURIComponent(grantType))
        .replace("{token-use}", encodeURIComponent(tokenUse))
        .replace("{access-token}", encodeURIComponent(user.accessToken))
        .replace("{api-client-id}", encodeURIComponent(apiClientId))
        .replace("{client-assertion-type}", encodeURIComponent(clientAssertionType))
        .replace("{client-assertion}", encodeURIComponent(clientAssertion))

    return new Promise<string>(function (resolve, reject) {
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
            },
                function (error, response, body) {
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
                    } else {
                        reject(error);
                    }
                });
        }
        catch(err) {
            MEEServices.trackWarning("behalfof token get failure: " + err);
            reject(err);
        }
    });
}
//获取指纹
export function getCertThumbprint(): string {
    if (Environment.isProduction() || Environment.isStaging()) {
        return process.env.CERT_THUMBPRINT;
    }
    else {
        return '2kk5TTTNNtWi6Q0bFbI3g3PLCI0=';
    }

}
//获得证书密钥
export function getCertPrivateKey(): string {//readFileSync同步读取文件，readFile为异步读取文件
    let key: string = Environment.isLocalDev() ? String(fs.readFileSync('private.pem')) : process.env.CERT_PRIVATE_KEY;
    return Utilities.replacePipesWithLineFeeds(key);
}
