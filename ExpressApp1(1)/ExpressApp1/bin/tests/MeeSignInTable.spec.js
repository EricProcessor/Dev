"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const RandomGenerator_1 = require("../tools/RandomGenerator");
const StorageConfig_1 = require("../StorageConfig");
const MeeSignInTable_1 = require("../MeeSignInTable");
const Config_1 = require("../Config");
let Gen = new RandomGenerator_1.RandomGenerator();
// Setup local emulator for unit tests.
Config_1.Config.useLocalEmulator = true;
let table = new MeeSignInTable_1.SignInTelemetryTable(StorageConfig_1.StorageConfig.getTelemetryTableSettings());
describe('Test SignIn Table', () => {
    it('Insert and Retrieve', (done) => {
        let user = Gen.GenerateUser();
        let userId = Gen.GenerateUserID(user.tenantId, user.unique_name);
        let newUser = true;
        let isWhiteListed = false;
        table.recordUser(user, newUser, isWhiteListed, userId)
            .then((result) => {
            let testSigin = {};
            testSigin.RandomId = result.RandomId;
            testSigin.Date = result.Date;
            return table.retrieve(testSigin);
        }).then((result) => {
            chai_1.expect(result.exists, 'Sign In telemetry exists').equals(true);
            let entity = result.entity;
            chai_1.expect(entity.AnonomizedUserId).equals(user.anonimizedOid);
            chai_1.expect(entity.Application).equals(userId.clientApplication);
            chai_1.expect(entity.ClientVersion).equals(userId.clientDisplayVersion);
            chai_1.expect(entity.IsLicensed, 'Is Licensed').equals(user.isLicensed);
            chai_1.expect(entity.IsNewUser, 'New User').equals(newUser);
            chai_1.expect(entity.IsWhiteListed, 'WhiteListed').equals(isWhiteListed);
            chai_1.expect(entity.LicenseType).equals(user.licenseType);
            chai_1.expect(entity.OSVersion).equals(userId.osVersion);
            chai_1.expect(entity.Role).equals(user.role);
            chai_1.expect(entity.Skin).equals(user.skin);
            chai_1.expect(entity.TenantId).equals(userId.tenantId);
            done();
        }, (reason) => done(reason));
    }),
        it('Make sure record works when user is empty', (done) => {
            let userId = Gen.GenerateUserID();
            let role = "someRole";
            table.recordUser(undefined, undefined, undefined, userId, role)
                .then((result) => {
                table.get(result.Date, result.RandomId).then((data) => {
                    chai_1.expect(data.exists).equals(true);
                    let e = data.entity;
                    chai_1.expect(e.IsWhiteListed).to.be.undefined;
                    chai_1.expect(e.AnonomizedUserId).to.be.undefined;
                    chai_1.expect(e.IsLicensed).to.be.undefined;
                    chai_1.expect(e.LicenseType).to.be.undefined;
                    chai_1.expect(e.RemainingTrials).to.be.undefined;
                    chai_1.expect(e.Role).to.equal(role);
                    chai_1.expect(e.OSVersion).to.equal(userId.osVersion);
                    chai_1.expect(e.OSPlatform).to.be.ok;
                    done();
                }, res => done(res));
            }, res => done(res));
        });
});
//# sourceMappingURL=MeeSignInTable.spec.js.map