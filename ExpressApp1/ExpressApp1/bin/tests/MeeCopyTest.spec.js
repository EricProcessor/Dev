"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const guid_1 = require("../core/guid");
const RandomGenerator_1 = require("../tools/RandomGenerator");
const AzureTable_1 = require("../AzureTable");
const MeeUserTable_1 = require("../MeeUserTable");
require("mocha");
const azure_storage_1 = require("azure-storage");
const Config_1 = require("../Config");
const StorageConfig_1 = require("../StorageConfig");
const UserCopy_1 = require("../tools/UserCopy");
Config_1.Config.useLocalEmulator = true;
let origTableSetting = StorageConfig_1.StorageConfig.getUserTableSettings('OriginalUserTable', 'unique_name');
let origTable = new AzureTable_1.AzureTable(origTableSetting);
let origUserTable = new MeeUserTable_1.UserTable(origTableSetting);
let newTableSetting = StorageConfig_1.StorageConfig.getUserTableSettings('NewUserTable', 'oid');
let newTable = new MeeUserTable_1.UserTable(newTableSetting);
let Gen = new RandomGenerator_1.RandomGenerator();
describe('Test Copy UserTable', () => {
    it('setup', (done) => {
        let tenantCount = Gen.Integer(3, 10);
        let promises = [];
        // Chain batch inserts as they can fail. 
        let asyncFuncs = [];
        for (let x = 0; x < tenantCount; x++) {
            asyncFuncs.push(() => {
                let tenantId = guid_1.Guid.newGuid();
                let users = Array.from({ length: Gen.Integer(40, 100) }, () => Gen.GenerateuserWithoutAoid(tenantId));
                console.log('tenant:' + tenantId + ' users:' + users.length);
                return origTable.batchInsertEntity(users);
            });
        }
        asyncFuncs.reduce((prev, curr) => {
            return prev.then(curr);
        }, Promise.resolve())
            .then(() => {
            done();
        }, (reason) => done(reason));
    }).timeout(0);
    it('Test Copy', (done) => {
        let copy = new UserCopy_1.UserCopy(origTableSetting, newTableSetting);
        copy.copy()
            .then(() => origUserTable.queryEntities(new azure_storage_1.TableQuery()))
            .then((result) => {
            /*result.forEach((user) => { Removed this since we now crate an anonid
                expect(user.anonimizedOid, 'undefined').is.undefined;
            })*/
            return newTable.queryAllUsers();
        })
            .then((res) => {
            res.forEach((user) => {
                chai_1.expect(user.anonimizedOid, 'is defined').is.not.undefined;
                chai_1.expect(user.anonimizedOid, 'anon check').to.be.a('string').and
                    .to.have.length.above(10).and
                    .is.not.equal(user.oid).and
                    .is.not.equal(user.tenantId);
            });
        })
            .then(() => done(), (reason) => done(reason))
            .catch((reason) => done(reason));
    }).timeout(0);
});
//# sourceMappingURL=MeeCopyTest.spec.js.map