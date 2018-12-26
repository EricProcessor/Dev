"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AzureTable_1 = require("./AzureTable");
const guid_1 = require("./core/guid");
class SignInTelemetryTable extends AzureTable_1.AzureTable {
    constructor(setting) {
        super(setting);
    }
    getOsVersion(version) {
        let osPlatform = "Windows";
        if (version.match(/macos/i)) {
            osPlatform = "macOS";
        }
        else if (version.match(/ios/i)) {
            osPlatform = "iOS";
        }
        else if (version.match(/android/i)) {
            osPlatform = "Android";
        }
        return osPlatform;
    }
    get(date, guid) {
        let signin = {};
        signin.Date = date;
        signin.RandomId = guid;
        return this.retrieve(signin);
    }
    /**
     * Record the user sign in telemetry
     * @param user Information that is stored about the user. Can be undefined, in which case it is ignored.
     * @param isNewUser
     * @param isWhiteListed
     * @param userID
     * @param role Optional role if user is not available. Used during classroom signin
     */
    recordUser(user, isNewUser, isWhiteListed, userID, role = undefined) {
        // TODO: What should we do if osVersion is undefined.
        let osPlatform = this.getOsVersion(userID.osVersion);
        let dt = new Date();
        let signinTelemetry = {};
        {
            signinTelemetry.Date = dt.toISOString().substring(0, 10);
            signinTelemetry.RandomId = guid_1.Guid.newGuid();
            signinTelemetry.TenantId = userID.tenantId;
            signinTelemetry.ClientVersion = userID.clientDisplayVersion;
            signinTelemetry.Application = userID.clientApplication;
            signinTelemetry.OSPlatform = osPlatform;
            signinTelemetry.OSVersion = userID.osVersion;
            signinTelemetry.IsNewUser = isNewUser;
            signinTelemetry.IsWhiteListed = isWhiteListed;
            signinTelemetry.Role = role;
            signinTelemetry.AppDetail = userID.getPlatformInfo().getType();
            // There are cases where user has not yet been created, since the user logged in 
            // through cm mode first. Currently for such cases leaving information blank.
            if (user) {
                signinTelemetry.AnonomizedUserId = user.anonimizedOid;
                signinTelemetry.LicenseType = user.licenseType;
                signinTelemetry.Skin = user.skin;
                signinTelemetry.Role = user.role;
                signinTelemetry.IsLicensed = user.isLicensed;
                signinTelemetry.RemainingTrials = 0;
                let remainingTrials = user.trialsAllowed - user.trialsUsed;
                if (remainingTrials >= 0) {
                    signinTelemetry.RemainingTrials = remainingTrials;
                }
            }
        }
        return this.insertOrReplace(signinTelemetry).then(() => signinTelemetry);
    }
}
exports.SignInTelemetryTable = SignInTelemetryTable;
//# sourceMappingURL=MeeSignInTable.js.map