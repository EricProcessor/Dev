import {expect} from 'chai'
import {Guid} from '../core/guid'
import {RandomGenerator} from "../tools/RandomGenerator"

import { TableSetting, RetrievedEntity, AzureTable } from "../AzureTable"
import {User,  UserTable, UserInfo, MultiUserTable} from "../MeeUserTable"
import {UserID} from "../AAD"

import 'mocha'
import { TableQuery, TableBatch, TableUtilities } from 'azure-storage';
import { Config } from '../Config';
import { StorageConfig } from '../StorageConfig';
import {Environment, EnvironmentType} from '../core/environment'
import { acceptEula } from '../MEEServices';

export interface UserWithoutAoid {
    acceptedEula: boolean;
    isLicensed: boolean;
    lastLicenseCheck: Date;
    lastRoleCheck: Date;
    name: string;
    nickname: string;
    oid: string;
    role: string;
    skin: string;
    tenantId: string;
    trialsAllowed: number;
    trailsUsed: number;
    unique_name: string;
    licenseType: string;
}

let Gen = new RandomGenerator();

// Setup local emulator for unit tests.
Config.useLocalEmulator = true;
let table : UserTable = new UserTable(StorageConfig.getUserTableSettings()); 
let userWithoutOidTable : AzureTable<UserWithoutAoid> = new AzureTable<UserWithoutAoid>(StorageConfig.getUserTableSettings()); 

let tempTableCount : number = 0;

let multiUserTable = new MultiUserTable(StorageConfig.getUserTableSettings('originalusertable'), StorageConfig.getUserTableSettings('newusertable', 'oid'));

describe('Test Multi UserTable', () => {
    it('Test creation Add new user', (done) => {
        let userID : UserID = {} as any;
        userID.tenantId = Guid.newGuid();
        userID.unique_name = 'aTestUniqueName';
        userID.name = 'testName';
        userID.userName = 'testUserName';
        userID.oid = Guid.newGuid();
        let role = 'teacher';
        let anonId = Guid.newGuid();
        multiUserTable.addNewUser(userID, role, false, 'm365', anonId)
            .then((result) => {
                let user : User = {} as any;
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
    it ('Try to updateExistingUser', (done) => {
        interface userWithoutSomeFields {
            name: string;
            oid: string;
            tenantId: string;
            unique_name: string;
        };
        
        let testUser : userWithoutSomeFields = {} as any;
        {
            testUser.name = Gen.GenerateName();
            testUser.oid = Guid.newGuid();
            testUser.tenantId = Guid.newGuid();
            testUser.unique_name = Gen.GenerateEmailFromName(testUser.name);
        }

        let userId = Gen.GenerateUserID(testUser.tenantId, testUser.unique_name, testUser.oid);
        let date = new Date();
        let role = "teacher";

        let userTableTemp = new AzureTable<userWithoutSomeFields>(StorageConfig.getUserTableSettings('originalusertable'));
        userTableTemp.insertOrReplace(testUser)
            .then(() => multiUserTable.get(userId))
            .then((result) => {
                expect(result, 'result').is.ok;
                expect(result.exists).is.true;
                expect(result.entity).is.ok;
                expect(result.entity.name).equals(testUser.name);
                expect(result.entity.oid).equals(testUser.oid);
                expect(result.entity.tenantId).equals(testUser.tenantId);
                expect(result.entity.unique_name).equals(testUser.unique_name);
                return multiUserTable.updateExistingUser(userId, result.entity, role, date, false, undefined, date);
            }).then((existingUser) => {
                compareUserInfoAndUserID(existingUser, userId, role, 24, date, false);
                return multiUserTable.get(userId);
            }).then((result) => {
                expect(result, 'Retrieved Entity').is.ok;
                expect(result.entity, 'entity').is.ok;
                expect(result.exists, 'exists').equals(true);
                validateUser(result.entity, userId, role, undefined, false);                
                done();
            }).catch((reason) => done(reason));
    })
});

describe ('Test User Table', () => {
    it ('Create a bunch of users with batch', (done) => {
        let tenantCount = Gen.Integer(1, 5);
        let promises : Promise<any>[] = [];

        // Chain batch inserts as they can fail. 
        let asyncFuncs = [];
        for (let x = 0; x < tenantCount; x++) {
            asyncFuncs.push(() => {
                let tenantId = Guid.newGuid();
                let users : UserWithoutAoid[] = Array.from({ length: Gen.Integer(5, 100) }, () => Gen.GenerateuserWithoutAoid(tenantId));                
                tempTableCount += users.length;
                return userWithoutOidTable.batchInsertEntity(users);
            })
        }

        asyncFuncs.reduce((prev, curr) => {
            return prev.then(curr);
        }, Promise.resolve())
        .then(() => {
            done();
        },
        (reason) => done(reason));
    }).timeout(0),
    it ('Query created users and make sure anonimized fields dont exist', (done) => {
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

            expect(count, 'Ensure that anonimizedOid doesnt exist').least(tempTableCount);    
            done();
        })
        .catch(error => done(error));
    }).timeout(0),
    it ('Run Anomimized Script and make sure fields are updated - Long running', (done) => {
        let count = 0;
        table.queryAllUsers()
        .then((result) => { 
            count = result.length;
            return table.generateAnonimizedOid();
        })
        .then(() => table.queryAllUsers())
        .then((result) => { 
            expect(result.length, "Ensure user count didn't change").is.equal(count);
            result.forEach(element => {
                expect(element.anonimizedOid, 'Ensure aOid was modified').is.not.undefined;
            });

            done();
         },
        (reason) => done(reason));
    }).timeout(0),
    it ('Try to addNewUser', (done) => {
        let userID : UserID = {} as any;
        userID.tenantId = Guid.newGuid();
        userID.unique_name = 'aTestUniqueName';
        userID.name = 'testName';
        userID.userName = 'testUserName';
        userID.oid = Guid.newGuid();
        let anonId =Guid.newGuid();
        let role = 'teacher';
        table.addNewUser(userID, role, false, 'm365', anonId)
            .then((result) => {
                let user : User = {} as any;
                user.tenantId = userID.tenantId;
                user.unique_name = userID.unique_name;
                return table.retrieve(user);
            }).then((result) => {
                compareRetrivedEntityAndUserID(result, userID, role, true, anonId);                
                done();
            },
            (reason) => done(reason));
    }),
    it ('Try to updateExistingUser', (done) => {
        interface userWithoutSomeFields {
            name: string;
            oid: string;
            tenantId: string;
            unique_name: string;
        };
        
        let testUser : userWithoutSomeFields = {} as any;
        {
            testUser.name = Gen.GenerateName();
            testUser.oid = Guid.newGuid();
            testUser.tenantId = Guid.newGuid();
            testUser.unique_name = Gen.GenerateEmailFromName(testUser.name);
        }

        let userId = Gen.GenerateUserID(testUser.tenantId, testUser.unique_name, testUser.oid);
        let date = new Date();
        let role = "teacher";

        let userTableTemp = new AzureTable<userWithoutSomeFields>(StorageConfig.getUserTableSettings());
        userTableTemp.insertOrReplace(testUser)
            .then(() => table.get(userId))
            .then((result) => {
                compareRetrivedEntityAndUserID(result, userId, undefined, false);
                return table.updateExistingUser(userId, result.entity, role, date, false, undefined, date);
            }).then((existingUser) => {
                compareUserInfoAndUserID(existingUser, userId, role, 24, date, false);
                return table.get(userId);
            }).then((result) => {
                expect(result, 'Retrieved Entity').is.ok;
                expect(result.entity, 'entity').is.ok;
                expect(result.exists, 'exists').equals(true);
                validateUser(result.entity, userId, role, undefined, false);                
                done();
            }).catch((reason) => done(reason));
    }),
    it ('Test AzureTable insertAndMerge', (done) => {

        var user: User = {} as any;
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

        let modifyUserWithUndefined: User = {} as any;
        modifyUserWithUndefined.tenantId = user.tenantId;
        modifyUserWithUndefined.unique_name = user.unique_name;
        modifyUserWithUndefined.trialsAllowed = undefined;
        modifyUserWithUndefined.trialsUsed = 5;
        modifyUserWithUndefined.role = undefined;

        let userID : User = {} as any;
            userID.tenantId = user.tenantId;
            userID.unique_name = user.unique_name;
            userID.oid = user.oid;

        let addUser = table.insertOrReplace(user);
        addUser.then(() => table.insertOrMerge(modifyUserWithUndefined))
        .then(() => table.retrieve(userID))
        .then( (result) => {
            let entity = result.entity;
            expect(result.exists, 'Check if result exists').to.equal(true);
            expect(entity.isLicensed, 'Check if licensed').equal(user.isLicensed);
            expect(entity.role, 'role').equal(user.role);
            expect(entity.trialsAllowed, 'trialsallowed').equal(user.trialsAllowed);
            expect(entity.trialsUsed, 'trialsused').equal(user.trialsUsed);
            expect(entity.unique_name, 'Unique_name').equal(user.unique_name);
            expect(entity.tenantId,'tenantid').equal(user.tenantId);
            expect(entity.oid,'oid').equal(user.oid);
            return result
        }).then((result) => table.delete(result.entity))
        .then(() => table.retrieve(userID))
        .then((result) => {
            expect(result).ok;
            expect(result.exists, 'exists').to.equal(false);
            done();
        },
        (reason) => done(reason));    

    }).timeout(5000),
    it ('Oid As Rowkey', (done) => {
        let userid = Gen.GenerateUserID();
        let oidTable = new UserTable(StorageConfig.getUserTableSettings('newusertable', 'oid'));
        let query = TableQuery.combineFilters(
            TableQuery.stringFilter("PartitionKey", TableUtilities.QueryComparisons.EQUAL, userid.tenantId),
            "and",
            TableQuery.stringFilter("RowKey", TableUtilities.QueryComparisons.EQUAL, userid.oid));
        let tableQuery = new TableQuery().where(query);
        let anonid = Guid.newGuid();
        oidTable.addNewUser(userid, "teacher", true, "somelicence", anonid)
        .then((result) => oidTable.queryEntities(tableQuery))
        .then((result) => {
            expect(result.length, 'Length').equals(1);
            let user = result[0];
            expect(user.tenantId, 'Check tenantid').equals(userid.tenantId);
            expect(user.oid, 'oid').equals(userid.oid);
            expect(user.unique_name, 'unique_name').equals(userid.unique_name);
            expect(user.role, 'role').equals("teacher");
            expect(user.licenseType, 'licencetype').equals("somelicence");
            done();
        },
        (reason) => done(reason))
    })
});

function compareUserInfoAndUserID(result: UserInfo, userID: UserID, role: string, expectedTrialCount:number, date: Date = undefined, isLicensed: boolean = undefined, licencetype:string = undefined, skin:string = undefined) {
    expect(result, 'userInfo').is.ok;
    if (isLicensed) {
        expect(result.remainingTrialCount, 'remainingTrialCount').equals(0);    
    }
    else {
        expect(result.remainingTrialCount, 'remainingTrialCount').equals(expectedTrialCount);
    }

    validateUser(result.user, userID, role, date, isLicensed, licencetype);
}

function validateUser(user: User, userID: UserID, role: string, date: Date,
                isLicensed: boolean = undefined, licencetype:string = undefined, skin:string = undefined) {

    expect(user, 'user').is.ok;
    expect(user.role, 'role').equals(role);
    expect(user.isLicensed, 'isLicensed').equals(isLicensed);
    expect(user.licenseType, 'licenseType').equals(licencetype);
    expect(user.skin, 'skin').equals(skin ? skin : "EduSkins_Alex");

    if (!isLicensed) {
        expect(user.trialsAllowed, 'trailsallowed').equals((role === "teacher" ? Config.startingTrialCountTeacher : Config.startingTrialCountStudent));
        expect(user.trialsUsed, 'trialsUsed').equals(1);
    }

    expect(user.name, 'name').equals(userID.name);
    expect(user.tenantId, 'tenantId').equals(userID.tenantId);
    expect(user.oid, 'oid').equals(userID.oid);
    expect(user.unique_name, 'unique_name').equals(userID.unique_name);

    expect(user.lastLicenseCheck).is.ok;
    expect(user.lastRoleCheck).is.ok;
    if (date) {
        expect(user.lastLicenseCheck, 'lastLicenseCheck').equals(date);
        expect(user.lastRoleCheck, 'lastRoleCheck').equals(date);
    }

    expect(user.anonimizedOid, 'Check anonimizedOid')
            .to.be.a('string').and
            .to.have.length.above(10).and
            .is.not.equal(userID.oid).and            
            .is.not.equal(userID.tenantId);
}

function compareRetrivedEntityAndUserID(result: RetrievedEntity<User>, userID: UserID, role: string, checkAnon: boolean = true, expectedAnonId:string = undefined) {
    expect(result, 'Retrieved Entity').is.ok;
    expect(result.entity, 'entity').is.ok;
    expect(result.exists, 'exists').equals(true);
    let entity = result.entity;
    expect(entity.unique_name, 'unique name').equal(userID.unique_name);
    expect(entity.tenantId, 'tenantId').equal(userID.tenantId);
    expect(entity.role, 'role').equals(role);
    expect(entity.oid, 'oid').equals(userID.oid);
    if (checkAnon) {
        expect(entity.anonimizedOid, 'Check anonimizedOid')
            .to.be.a('string').and
            .to.have.length.above(10).and
            .is.not.equal(userID.oid).and            
            .is.not.equal(userID.tenantId);
        if (expectedAnonId) {
            expect(entity.anonimizedOid, 'Make sure anonimizedID is the same')
                .is.equal(expectedAnonId);
        }
    }
}