import { request } from "http";
import * as Request from 'request-promise'
import { UserID, getOnBehalfOfToken } from "./AAD";
import { logActivityVerbose } from "./Logger";
import { trackDependency } from "./MEEServices";
import { RSA_PKCS1_OAEP_PADDING } from "constants";

export interface TenancyInfo {
    isManaged: boolean;
    isEduTenant: boolean;
    enableFreeMinecraftLicenses: boolean;
};

interface GetAccountInfoForMinecraftResponse {
    isManaged: boolean,
    isEduTenant: boolean,
    enableFreeMinecraftLicenses: boolean // This indicates that the user has enabled the toggle to get office licenses.
};

export class CheckTenancy {

    // 
    public static async CheckIfShouldInferLicense(user: UserID) : Promise<GetAccountInfoForMinecraftResponse> {
        return new Promise<GetAccountInfoForMinecraftResponse>(async (resolve, reject) => {
            // Appid for mfsb is 45a330b1-b1ec-4cc1-9161-9f03992aa49f
            let token = await getOnBehalfOfToken(user, "45a330b1-b1ec-4cc1-9161-9f03992aa49f");
            let options: Request.Options = {
                uri: `https://businessstore.microsoft.com/AccountInfo/GetAccountInfoForMinecraft`,
                json: true,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            logActivityVerbose('signin-CheckMinecraftLicense', user.tenantId, user.unique_name, "");
            let startTime = Date.now();
            Request(options)
                .then((data: GetAccountInfoForMinecraftResponse) => {
                    trackDependency("businessstore.microsoft.com/AccountInfo/GetAccountInfoForMinecraft", "enableFreeMinecraftLicenses", Date.now() - startTime, true);
                    resolve(data);
                })
                .catch((err) => {
                    reject(err)
                });
        });
    }

    public static async CheckAccount(user: UserID) : Promise<TenancyInfo> {
        // Tenancy info interface and GetAccountInfoForMinecraftResponse match, so no conversion is needed
        return CheckTenancy.CheckIfShouldInferLicense(user) as Promise<TenancyInfo>;
    }
};
