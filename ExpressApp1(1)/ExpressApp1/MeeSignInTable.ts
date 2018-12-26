import {AzureTable, TableSetting, RetrievedEntity} from "./AzureTable"

import {User} from "./MeeUserTable" // TODO: Move to AAD.ts
import {UserID} from "./AAD"
import {Guid} from "./core/guid"

/**
 * SignInTelemtry Schema that is used to create a table.
 * 
 * Warning: Modifying this will impact the table schema.
 */
export interface SignInTelemetry {
    Date: string;
    RandomId: string;
    AnonomizedUserId :string; // Was OMSUserId, anoniyzed
    TenantId : string;  // Was OMSTenantId
    Application: string;  // Was ClientType   
    ClientVersion: string;
    OSPlatform: string;
    OSVersion: string;
    IsLicensed: boolean;
    LicenseType: string;
    Role: string;
    IsNewUser: boolean;
    IsWhiteListed: boolean;
    Skin: string;
    RemainingTrials: number;
    AppDetail: string;
}

export class SignInTelemetryTable extends AzureTable<SignInTelemetry> {
    constructor(setting: TableSetting) {
        super(setting);
    }

    private getOsVersion(version: string) : string{
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

    public get(date: string, guid: string) : Promise<RetrievedEntity<SignInTelemetry>> {
        let signin : SignInTelemetry = {} as any;
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
    public recordUser(user: User, isNewUser: boolean, isWhiteListed: boolean, userID: UserID, role: string = undefined): Promise<SignInTelemetry> {       
        // TODO: What should we do if osVersion is undefined.
        let osPlatform = this.getOsVersion(userID.osVersion);

        let dt = new Date();

        let signinTelemetry : SignInTelemetry = {} as any;
        {
            signinTelemetry.Date = dt.toISOString().substring(0, 10);
            signinTelemetry.RandomId = Guid.newGuid();
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

                signinTelemetry.RemainingTrials = 0
                let remainingTrials = user.trialsAllowed - user.trialsUsed;
                if (remainingTrials >= 0) {
                    signinTelemetry.RemainingTrials = remainingTrials;
                }
            }           
        }
        
        return this.insertOrReplace(signinTelemetry).then(() => signinTelemetry);
    }
}