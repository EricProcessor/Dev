import 'mocha'
import {expect} from 'chai'

import {RandomGenerator} from "../tools/RandomGenerator"

import { StorageConfig } from '../StorageConfig';
import {Environment, EnvironmentType} from '../core/environment'
import { SignInTelemetryTable, SignInTelemetry } from '../MeeSignInTable';
import {Config} from '../Config'

let Gen = new RandomGenerator();

// Setup local emulator for unit tests.
Config.useLocalEmulator = true;
let table : SignInTelemetryTable = new SignInTelemetryTable(StorageConfig.getTelemetryTableSettings());

describe ('Test SignIn Table', () => {
    it('Insert and Retrieve', (done) => {
        let user = Gen.GenerateUser();
        let userId = Gen.GenerateUserID(user.tenantId, user.unique_name);

        let newUser = true;
        let isWhiteListed = false;
        table.recordUser(user, newUser, isWhiteListed, userId)
            .then((result) => {
                let testSigin: SignInTelemetry = {} as any;
                testSigin.RandomId = result.RandomId;
                testSigin.Date = result.Date;

                return table.retrieve(testSigin);
            }).then((result) => {
                expect(result.exists, 'Sign In telemetry exists').equals(true);

                let entity = result.entity;
                expect(entity.AnonomizedUserId).equals(user.anonimizedOid);
                expect(entity.Application).equals(userId.clientApplication);
                expect(entity.ClientVersion).equals(userId.clientDisplayVersion);
                expect(entity.IsLicensed, 'Is Licensed').equals(user.isLicensed);
                expect(entity.IsNewUser, 'New User').equals(newUser);
                expect(entity.IsWhiteListed, 'WhiteListed').equals(isWhiteListed);
                expect(entity.LicenseType).equals(user.licenseType);
                expect(entity.OSVersion).equals(userId.osVersion);
                expect(entity.Role).equals(user.role);
                expect(entity.Skin).equals(user.skin);
                expect(entity.TenantId).equals(userId.tenantId);
                done();
            },
            (reason) => done(reason));
    }),
    it('Make sure record works when user is empty', (done) => {
        let userId = Gen.GenerateUserID();
        let role = "someRole";
        table.recordUser(undefined, undefined, undefined, userId, role)
        .then((result) => {
            table.get(result.Date, result.RandomId).then((data) => {
                expect(data.exists).equals(true);
                let e = data.entity;
                expect(e.IsWhiteListed).to.be.undefined;
                expect(e.AnonomizedUserId).to.be.undefined;
                expect(e.IsLicensed).to.be.undefined;
                expect(e.LicenseType).to.be.undefined;
                expect(e.RemainingTrials).to.be.undefined;
                expect(e.Role).to.equal(role);
                expect(e.OSVersion).to.equal(userId.osVersion);
                expect(e.OSPlatform).to.be.ok;
                done();
            },
            res => done(res));
        },
        res => done(res));
    })
});
