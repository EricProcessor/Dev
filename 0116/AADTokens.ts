declare var Buffer: any;
declare function escape(s: string): string;

const clientIdGuid = "b36b1432-1a1c-4c82-9b76-24de1cab42f2";
const audience = "https://meeservices.minecraft.net";

export class AADIdentity {
    constructor(
        private iss: string,
        private iat: number,
        private exp: number,
        private tid: string,
        private unique_oid: string,
        private unique_name: string,
        private user_name: string,
        private full_name: string,
        private identity_token: any)
    {
    }

    static fromToken(identityToken: string): AADIdentity {
        let user = null;

        if (identityToken.startsWith('{\"test')) {
            // tests pass in a 'fake' identity token since 
            // they cannot seem to get a real one with adal-node
            user = _createUserForTests(identityToken);
        }
        else {
            user = _createUser(identityToken);
        }
        console.log("fromToken----user"+JSON.stringify(user));
        if (user) {
            if (user.profile) {
                // console.log("解码方法进来了444");
                return new AADIdentity(
                    user.profile.iss,
                    user.profile.iat,
                    user.profile.exp,
                    user.profile.tid,
                    user.profile.oid,
                    user.profile.unique_name.trim().toLowerCase(),
                    user.userName,
                    user.profile.name,
                    identityToken);
            }
            else if (user.parsedJson) {
                throw Error("token error: parsedJson: " + user.parsedJson);
            }
            else {
                throw Error("token error: user: " + JSON.stringify(user));                
            }
        }
        else {
                throw Error("token error: user is null");
        }
    }

    get issuer(): string {
        return this.iss;
    }

    get expirationDate(): Date {
        let expDate = new Date(this.exp * 1000);
        let gracePeriod = 7 * 24 * 60 * 60 * 1000;
        return new Date(expDate.getTime() + gracePeriod);
    }

    get issuedAtTime(): Date {
        return new Date(this.iat * 1000);
    }

    get name(): string {
        return this.full_name;
    }

    get tenantId(): string {
        return this.tid;
    }

    get oid(): string {
        return this.unique_oid;
    }

    get identityToken(): any {
        return this.identity_token;
    }

    get uniqueName(): string {
        return this.unique_name;
    }

    get userName(): string {
        return this.user_name;
    }
}

// == IMPLEMENTATIONS BELOW COME FROM ADAL.JS ==============================================

interface AADUser {
    userName: string,
    profile: any
        // An example profile object
        // "aud":"b36b1432-1a1c-4c82-9b76-24de1cab42f2",
        // "iss":"https://sts.windows.net/f873649e-3bb8-4b80-8bb1-5005df979ade/",
        // "iat":1462145942,
        // "nbf":1462145942,
        // "exp":1462149842,
        // "amr":["pwd"],
        // "family_name":"Bob",
        // "given_name":"Johnson",
        // "ipaddr":"108.183.128.44",
        // "name":"Bob Johnson",
        // "oid":"c8c97d18-54d2-47c0-a060-7bf2660f51f6",
        // "sub":"_qPedBIcNGXMIpIqDfsmk6eXkvYBB1rFvBi3U78TsCE",
        // "tid":"f873649e-3bb8-4b80-8bb1-5005df979ade",
        // "unique_name":"bjohnson@school.edu",
        // "upn":"bjohnson@school.edu",
        // "ver":"1.0"
}

interface AADCrackedToken  {
    header: string,
    JWSPayload: string,
    JWSSig: string
}

function _createUserForTests(idTokenString): AADUser {
    let idToken = JSON.parse(idTokenString);
    let userName = idToken.uniqueName.trim().toLowerCase();
    let user = {
        userName: userName,
        profile: {
            iat: '',
            exp: idToken.exp,
            tid: idToken.tid,
            oid: idToken.oid,
            unique_name: userName,
            upn: userName,
            name: idToken.name
        }
    }

    return user; 
}

function _createUser(idToken): AADUser {
    let user = null;
    let parsedJson = _extractIdToken(idToken);

    if (parsedJson && parsedJson.hasOwnProperty('aud')) {
        let aud = parsedJson.aud.toLowerCase();
        if (aud === clientIdGuid || aud === audience) {
            user = {
                userName: '',
                profile: parsedJson
            };

            if (parsedJson.hasOwnProperty('upn')) {
                user.userName = parsedJson.upn;
            } else if (parsedJson.hasOwnProperty('email')) {
                user.userName = parsedJson.email;
            }
        } else {
            _logstatus('IdToken has invalid aud field');
        }
    }

    // temporary hack to debug bug 32587
    if (!user && parsedJson) {
        user = {
            'parsedJson': JSON.stringify(parsedJson)
        }
    }
    console.log("解码后user"+JSON.stringify(user))
    return user;
}

function _extractIdToken(encodedIdToken) {
    // id token will be decoded to get the username
    var decodedToken = _decodeJwt(encodedIdToken);
    if (!decodedToken) {
        return null;
    }

    try {
        var base64IdToken = decodedToken.JWSPayload;
        var base64Decoded = _base64DecodeStringUrlSafe(base64IdToken);
        if (!base64Decoded) {
            _logstatus('The returned id_token could not be base64 url safe decoded.');
            return null;
        }

        // ECMA script has JSON built-in support
        console.log("base64Decoded========"+base64Decoded);//编码前的token
        return JSON.parse(base64Decoded);
    } catch (err) {
        _logstatus('The returned id_token could not be decoded: ' + err.stack);
    }

    return null;
}

// Adal.node js crack function
function _decodeJwt(jwtToken): AADCrackedToken {
    const idTokenPartsRegex = /^([^\.\s]*)\.([^\.\s]+)\.([^\.\s]*)$/;

    let matches = idTokenPartsRegex.exec(jwtToken);
    // console.log(matches.length);
    // console.log("第0位"+matches[0]);
    // console.log("第1位"+matches[1]);
    // console.log("第2位"+matches[2]);
    // console.log("第3位"+matches[3]);
    if (!matches || matches.length < 4) {
        _logstatus('The returned id_token is not parseable.');
        return null;
    }

    var crackedToken: AADCrackedToken = {
        header: matches[1],
        JWSPayload: matches[2],
        JWSSig: matches[3]
    };

    return crackedToken;
}

function _base64DecodeStringUrlSafe(base64IdToken: string): string {
    base64IdToken = base64IdToken.replace(/-/g, '+').replace(/_/g, '/');
    // console.log("加密前"+base64IdToken);
    if (_atob) {
        return decodeURIComponent(escape(_atob(base64IdToken)));
    }

    // TODO add support for this
    _logstatus('Browser is not supported');
    return null;
}

function _atob(str) {
    return new Buffer(str, 'base64').toString('binary');
}

function _logstatus(message: string) {
    console.log(message);
}
