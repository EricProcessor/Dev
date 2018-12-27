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
const Request = require("request-promise");
const AAD_1 = require("./AAD");
const Logger_1 = require("./Logger");
const MEEServices_1 = require("./MEEServices");
;
;
class CheckTenancy {
    // 
    static CheckIfShouldInferLicense(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                // Appid for mfsb is 45a330b1-b1ec-4cc1-9161-9f03992aa49f
                let token = yield AAD_1.getOnBehalfOfToken(user, "45a330b1-b1ec-4cc1-9161-9f03992aa49f");
                let options = {
                    uri: `https://businessstore.microsoft.com/AccountInfo/GetAccountInfoForMinecraft`,
                    json: true,
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                };
                Logger_1.logActivityVerbose('signin-CheckMinecraftLicense', user.tenantId, user.unique_name, "");
                let startTime = Date.now();
                Request(options)
                    .then((data) => {
                    MEEServices_1.trackDependency("businessstore.microsoft.com/AccountInfo/GetAccountInfoForMinecraft", "enableFreeMinecraftLicenses", Date.now() - startTime, true);
                    resolve(data);
                })
                    .catch((err) => {
                    reject(err);
                });
            }));
        });
    }
    static CheckAccount(user) {
        return __awaiter(this, void 0, void 0, function* () {
            // Tenancy info interface and GetAccountInfoForMinecraftResponse match, so no conversion is needed
            return CheckTenancy.CheckIfShouldInferLicense(user);
        });
    }
}
exports.CheckTenancy = CheckTenancy;
;
//# sourceMappingURL=BusinessStoreService.js.map