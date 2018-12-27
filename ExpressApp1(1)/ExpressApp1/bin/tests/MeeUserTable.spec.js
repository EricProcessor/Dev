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
let Gen = new RandomGenerator_1.RandomGenerator();
// Setup local emulator for unit tests.
Config_1.Config.useLocalEmulator = true;
let table = new MeeUserTable_1.UserTable(StorageConfig_1.StorageConfig.getUserTableSettings());
let userWithoutOidTable = new AzureTable_1.AzureTable(StorageConfig_1.StorageConfig.getUserTableSettings());
let tempTableCount = 0;
let multiUserTable = new MeeUserTable_1.MultiUserTable(StorageConfig_1.StorageConfig.getUserTableSettings('originalusertable'), StorageConfig_1.StorageConfig.getUserTableSettings('newusertable', 'oid'));
describe('Test Multi UserTable', () => {
    it('Test creation Add new user', (done) => {
        let userID = {};
        userID.tenantId = guid_1.Guid.newGuid();
        userID.unique_name = 'aTestUniqueName';
        userID.name = 'testName';
        userID.userName = 'testUserName';
        userID.oid = guid_1.Guid.newGuid();
        let role = 'teacher';
        let anonId = guid_1.Guid.newGuid();
        multiUserTable.addNewUser(userID, role, false, 'm365', anonId)
            .then((result) => {
            let user = {};
            user.tenantId = userID.tenantId;
            user.unique_name = userID.unique_name;
            user.oid = userID.oid;
            return multiUserTable.get(userID);
        }).then((result) => {
            compareRetrivedEntityAndUserID(result, userID, role, true, anonId);
            return multiUserTable.get(userID, true);
        }).then((result) => {
            compareRetrivedEntityAndUserID(result, userID, role, true, anonId);
            done();
        }).catch((reason) => done(reason));
    }).timeout(5000),
        it('Try to updateExistingUser', (done) => {
            ;
            let testUser = {};
            {
                testUser.name = Gen.GenerateName();
                testUser.oid = guid_1.Guid.newGuid();
                testUser.tenantId = guid_1.Guid.newGuid();
                testUser.unique_name = Gen.GenerateEmailFromName(testUser.name);
            }
            let userId = Gen.GenerateUserID(testUser.tenantId, testUser.unique_name, testUser.oid);
            let date = new Date();
            let role = "teacher";
            let userTableTemp = new AzureTable_1.AzureTable(StorageConfig_1.StorageConfig.getUserTableSettings('originalusertable'));
            userTableTemp.insertOrReplace(testUser)
                .then(() => multiUserTable.get(userId))
                .then((result) => {
                chai_1.expect(result, 'result').is.ok;
                chai_1.expect(result.exists).is.true;
                chai_1.expect(result.entity).is.ok;
                chai_1.expect(result.entity.name).equals(testUser.name);
                chai_1.expect(result.entity.oid).equals(testUser.oid);
                chai_1.expect(result.entity.tenantId).equals(testUser.tenantId);
                chai_1.expect(result.entity.unique_name).equals(testUser.unique_name);
                return multiUserTable.updateExistingUser(userId, result.entity, role, date, false, undefined, date);
            }).then((existingUser) => {
                compareUserInfoAndUserID(existingUser, userId, role, 24, date, false);
                return multiUserTable.get(userId);
            }).then((result) => {
                chai_1.expect(result, 'Retrieved Entity').is.ok;
                chai_1.expect(result.entity, 'entity').is.ok;
                chai_1.expect(result.exists, 'exists').equals(true);
                validateUser(result.entity, userId, role, undefined, false);
                done();
            }).catch((reason) => done(reason));
        });
});
describe('Test User Table', () => {
    it('Create a bunch of users with batch', (done) => {
        let tenantCount = Gen.Integer(1, 5);
        let promises = [];
        // Chain batch inserts as they can fail. 
        let asyncFuncs = [];
        for (let x = 0; x < tenantCount; x++) {
            asyncFuncs.push(() => {
                let tenantId = guid_1.Guid.newGuid();
                let users = Array.from({ length: Gen.Integer(5, 100) }, () => Gen.GenerateuserWithoutAoid(tenantId));
                tempTableCount += users.length;
                return userWithoutOidTable.batchInsertEntity(users);
            });
        }
        asyncFuncs.reduce((prev, curr) => {
            return prev.then(curr);
        }, Promise.resolve())
            .then(() => {
            done();
        }, (reason) => done(reason));
    }).timeout(0),
        it('Query created users and make sure anonimized fields dont exist', (done) => {
            table.queryAllUsers()
                .then((result) => {
                if (result.length != tempTableCount) {
                    console.log('Looks like the table has some content, continuing. (' + result.length + ',' + tempTableCount + ')');
                }
                let count = 0;
                result.forEach(element => {
                    if (!element.anonimizedOid) {
                        count++;
                    }
                });
                chai_1.expect(count, 'Ensure that anonimizedOid doesnt exist').least(tempTableCount);
                done();
            })
                .catch(error => done(error));
        }).timeout(0),
        it('Run Anomimized Script and make sure fields are updated - Long running', (done) => {
            let count = 0;
            table.queryAllUsers()
                .then((result) => {
                count = result.length;
                return table.generateAnonimizedOid();
            })
                .then(() => table.queryAllUsers())
                .then((result) => {
                chai_1.expect(result.length, "Ensure user count didn't change").is.equal(count);
                result.forEach(element => {
                    chai_1.expect(element.anonimizedOid, 'Ensure aOid was modified').is.not.undefined;
                });
                done();
            }, (reason) => done(reason));
        }).timeout(0),
        it('Try to addNewUser', (done) => {
            let userID = {};
            userID.tenantId = guid_1.Guid.newGuid();
            userID.unique_name = 'aTestUniqueName';
            userID.name = 'testName';
            userID.userName = 'testUserName';
            userID.oid = guid_1.Guid.newGuid();
            let anonId = guid_1.Guid.newGuid();
            let role = 'teacher';
            table.addNewUser(userID, role, false, 'm365', anonId)
                .then((result) => {
                let user = {};
                user.tenantId = userID.tenantId;
                user.unique_name = userID.unique_name;
                return table.retrieve(user);
            }).then((result) => {
                compareRetrivedEntityAndUserID(result, userID, role, true, anonId);
                done();
            }, (reason) => done(reason));
        }),
        it('Try to updateExistingUser', (done) => {
            ;
            let testUser = {};
            {
                testUser.name = Gen.GenerateName();
                testUser.oid = guid_1.Guid.newGuid();
                testUser.tenantId = guid_1.Guid.newGuid();
                testUser.unique_name = Gen.GenerateEmailFromName(testUser.name);
            }
            let userId = Gen.GenerateUserID(testUser.tenantId, testUser.unique_name, testUser.oid);
            let date = new Date();
            let role = "teacher";
            let userTableTemp = new AzureTable_1.AzureTable(StorageConfig_1.StorageConfig.getUserTableSettings());
            userTableTemp.insertOrReplace(testUser)
                .then(() => table.get(userId))
                .then((result) => {
                compareRetrivedEntityAndUserID(result, userId, undefined, false);
                return table.updateExistingUser(userId, result.entity, role, date, false, undefined, date);
            }).then((existingUser) => {
                compareUserInfoAndUserID(existingUser, userId, role, 24, date, false);
                return table.get(userId);
            }).then((result) => {
                chai_1.expect(result, 'Retrieved Entity').is.ok;
                chai_1.expect(result.entity, 'entity').is.ok;
                chai_1.expect(result.exists, 'exists').equals(true);
                validateUser(result.entity, userId, role, undefined, false);
                done();
            }).catch((reason) => done(reason));
        }),
        it('Test AzureTable insertAndMerge', (done) => {
            var user = {};
            {
                user.acceptedEula = false;
                user.isLicensed = true;
                user.lastLicenseCheck = new Date();
                user.lastRoleCheck = new Date();
                user.name = "SomeNme";
                user.nickname = "SomeNickName";
                user.oid = "SomeGuid";
                user.role = "SomeRole";
                user.tenantId = "0002601d-5656-496c-94bb-37f4b902a432";
                user.unique_name = "RamdonUniqueName";
                user.trialsUsed = 5;
                user.trialsAllowed = 10;
            }
            let modifyUserWithUndefined = {};
            modifyUserWithUndefined.tenantId = user.tenantId;
            modifyUserWithUndefined.unique_name = user.unique_name;
            modifyUserWithUndefined.trialsAllowed = undefined;
            modifyUserWithUndefined.trialsUsed = 5;
            modifyUserWithUndefined.role = undefined;
            let userID = {};
            userID.tenantId = user.tenantId;
            userID.unique_name = user.unique_name;
            userID.oid = user.oid;
            let addUser = table.insertOrReplace(user);
            addUser.then(() => table.insertOrMerge(modifyUserWithUndefined))
                .then(() => table.retrieve(userID))
                .then((result) => {
                let entity = result.entity;
                chai_1.expect(result.exists, 'Check if result exists').to.equal(true);
                chai_1.expect(entity.isLicensed, 'Check if licensed').equal(user.isLicensed);
                chai_1.expect(entity.role, 'role').equal(user.role);
                chai_1.expect(entity.trialsAllowed, 'trialsallowed').equal(user.trialsAllowed);
                chai_1.expect(entity.trialsUsed, 'trialsused').equal(user.trialsUsed);
                chai_1.expect(entity.unique_name, 'Unique_name').equal(user.unique_name);
                chai_1.expect(entity.tenantId, 'tenantid').equal(user.tenantId);
                chai_1.expect(entity.oid, 'oid').equal(user.oid);
                return result;
            }).then((result) => table.delete(result.entity))
                .then(() => table.retrieve(userID))
                .then((result) => {
                chai_1.expect(result).ok;
                chai_1.expect(result.exists, 'exists').to.equal(false);
                done();
            }, (reason) => done(reason));
        }).timeout(5000),
        it('Oid As Rowkey', (done) => {
            let userid = Gen.GenerateUserID();
            let oidTable = new MeeUserTable_1.UserTable(StorageConfig_1.StorageConfig.getUserTableSettings('newusertable', 'oid'));
            let query = azure_storage_1.TableQuery.combineFilters(azure_storage_1.TableQuery.stringFilter("PartitionKey", azure_storage_1.TableUtilities.QueryComparisons.EQUAL, userid.tenantId), "and", azure_storage_1.TableQuery.stringFilter("RowKey", azure_storage_1.TableUtilities.QueryComparisons.EQUAL, userid.oid));
            let tableQuery = new azure_storage_1.TableQuery().where(query);
            let anonid = guid_1.Guid.newGuid();
            oidTable.addNewUser(userid, "teacher", true, "somelicence", anonid)
                .then((result) => oidTable.queryEntities(tableQuery))
                .then((result) => {
                chai_1.expect(result.length, 'Length').equals(1);
                let user = result[0];
                chai_1.expect(user.tenantId, 'Check tenantid').equals(userid.tenantId);
                chai_1.expect(user.oid, 'oid').equals(userid.oid);
                chai_1.expect(user.unique_name, 'unique_name').equals(userid.unique_name);
                chai_1.expect(user.role, 'role').equals("teacher");
                chai_1.expect(user.licenseType, 'licencetype').equals("somelicence");
                done();
            }, (reason) => done(reason));
        });
});
function compareUserInfoAndUserID(result, userID, role, expectedTrialCount, date = undefined, isLicensed = undefined, licencetype = undefined, skin = undefined) {
    chai_1.expect(result, 'userInfo').is.ok;
    if (isLicensed) {
        chai_1.expect(result.remainingTrialCount, 'remainingTrialCount').equals(0);
    }
    else {
        chai_1.expect(result.remainingTrialCount, 'remainingTrialCount').equals(expectedTrialCount);
    }
    validateUser(result.user, userID, role, date, isLicensed, licencetype);
}
function validateUser(user, userID, role, date, isLicensed = undefined, licencetype = undefined, skin = undefined) {
    chai_1.expect(user, 'user').is.ok;
    chai_1.expect(user.role, 'role').equals(role);
    chai_1.expect(user.isLicensed, 'isLicensed').equals(isLicensed);
    chai_1.expect(user.licenseType, 'licenseType').equals(licencetype);
    chai_1.expect(user.skin, 'skin').equals(skin ? skin : "EduSkins_Alex");
    if (!isLicensed) {
        chai_1.expect(user.trialsAllowed, 'trailsallowed').equals((role === "teacher" ? Config_1.Config.startingTrialCountTeacher : Config_1.Config.startingTrialCountStudent));
        chai_1.expect(user.trialsUsed, 'trialsUsed').equals(1);
    }
    chai_1.expect(user.name, 'name').equals(userID.name);
    chai_1.expect(user.tenantId, 'tenantId').equals(userID.tenantId);
    chai_1.expect(user.oid, 'oid').equals(userID.oid);
    chai_1.expect(user.unique_name, 'unique_name').equals(userID.unique_name);
    chai_1.expect(user.lastLicenseCheck).is.ok;
    chai_1.expect(user.lastRoleCheck).is.ok;
    if (date) {
        chai_1.expect(user.lastLicenseCheck, 'lastLicenseCheck').equals(date);
        chai_1.expect(user.lastRoleCheck, 'lastRoleCheck').equals(date);
    }
    chai_1.expect(user.anonimizedOid, 'Check anonimizedOid')
        .to.be.a('string').and
        .to.have.length.above(10).and
        .is.not.equal(userID.oid).and
        .is.not.equal(userID.tenantId);
}
function compareRetrivedEntityAndUserID(result, userID, role, checkAnon = true, expectedAnonId = undefined) {
    chai_1.expect(result, 'Retrieved Entity').is.ok;
    chai_1.expect(result.entity, 'entity').is.ok;
    chai_1.expect(result.exists, 'exists').equals(true);
    let entity = result.entity;
    chai_1.expect(entity.unique_name, 'unique name').equal(userID.unique_name);
    chai_1.expect(entity.tenantId, 'tenantId').equal(userID.tenantId);
    chai_1.expect(entity.role, 'role').equals(role);
    chai_1.expect(entity.oid, 'oid').equals(userID.oid);
    if (checkAnon) {
        chai_1.expect(entity.anonimizedOid, 'Check anonimizedOid')
            .to.be.a('string').and
            .to.have.length.above(10).and
            .is.not.equal(userID.oid).and
            .is.not.equal(userID.tenantId);
        if (expectedAnonId) {
            chai_1.expect(entity.anonimizedOid, 'Make sure anonimizedID is the same')
                .is.equal(expectedAnonId);
        }
    }
}
//# sourceMappingURL=MeeUserTable.spec.js.map