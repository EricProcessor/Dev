"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clientIdGuid = "b36b1432-1a1c-4c82-9b76-24de1cab42f2";
const audience = "https://meeservices.minecraft.net";
class AADIdentity {
    constructor(iss, iat, exp, tid, unique_oid, unique_name, user_name, full_name, identity_token) {
        this.iss = iss;
        this.iat = iat;
        this.exp = exp;
        this.tid = tid;
        this.unique_oid = unique_oid;
        this.unique_name = unique_name;
        this.user_name = user_name;
        this.full_name = full_name;
        this.identity_token = identity_token;
    }
    static fromToken(identityToken) {
        let user = null;
        if (identityToken.startsWith('{\"test')) {
            // tests pass in a 'fake' identity token since 
            // they cannot seem to get a real one with adal-node
            user = _createUserForTests(identityToken);
        }
        else {
            user = _createUser(identityToken);
        }
        if (user) {
            if (user.profile) {
                return new AADIdentity(user.profile.iss, user.profile.iat, user.profile.exp, user.profile.tid, user.profile.oid, user.profile.unique_name.trim().toLowerCase(), user.userName, user.profile.name, identityToken);
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
    get issuer() {
        return this.iss;
    }
    get expirationDate() {
        let expDate = new Date(this.exp * 1000);
        let gracePeriod = 7 * 24 * 60 * 60 * 1000;
        return new Date(expDate.getTime() + gracePeriod);
    }
    get issuedAtTime() {
        return new Date(this.iat * 1000);
    }
    get name() {
        return this.full_name;
    }
    get tenantId() {
        return this.tid;
    }
    get oid() {
        return this.unique_oid;
    }
    get identityToken() {
        return this.identity_token;
    }
    get uniqueName() {
        return this.unique_name;
    }
    get userName() {
        return this.user_name;
    }
}
exports.AADIdentity = AADIdentity;
function _createUserForTests(idTokenString) {
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
    };
    return user;
}
function _createUser(idToken) {
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
            }
            else if (parsedJson.hasOwnProperty('email')) {
                user.userName = parsedJson.email;
            }
        }
        else {
            _logstatus('IdToken has invalid aud field');
        }
    }
    // temporary hack to debug bug 32587
    if (!user && parsedJson) {
        user = {
            'parsedJson': JSON.stringify(parsedJson)
        };
    }
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
        return JSON.parse(base64Decoded);
    }
    catch (err) {
        _logstatus('The returned id_token could not be decoded: ' + err.stack);
    }
    return null;
}
// Adal.node js crack function
function _decodeJwt(jwtToken) {
    const idTokenPartsRegex = /^([^\.\s]*)\.([^\.\s]+)\.([^\.\s]*)$/;
    let matches = idTokenPartsRegex.exec(jwtToken);
    if (!matches || matches.length < 4) {
        _logstatus('The returned id_token is not parseable.');
        return null;
    }
    var crackedToken = {
        header: matches[1],
        JWSPayload: matches[2],
        JWSSig: matches[3]
    };
    return crackedToken;
}
function _base64DecodeStringUrlSafe(base64IdToken) {
    base64IdToken = base64IdToken.replace(/-/g, '+').replace(/_/g, '/');
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
function _logstatus(message) {
    console.log(message);
}
//# sourceMappingURL=AADTokens.js.map