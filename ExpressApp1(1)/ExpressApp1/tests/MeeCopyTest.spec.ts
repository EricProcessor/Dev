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
import {UserCopy} from '../tools/UserCopy'

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

Config.useLocalEmulator = true;
let origTableSetting = StorageConfig.getUserTableSettings('OriginalUserTable', 'unique_name');
let origTable = new AzureTable<UserWithoutAoid>(origTableSetting); 
let origUserTable = new UserTable(origTableSetting);

let newTableSetting = StorageConfig.getUserTableSettings('NewUserTable', 'oid');
let newTable : UserTable = new UserTable(newTableSetting); 

let Gen = new RandomGenerator();

describe('Test Copy UserTable', () => {
    it('setup', (done) => {
        let tenantCount = Gen.Integer(3, 10);
        let promises : Promise<any>[] = [];

        // Chain batch inserts as they can fail. 
        let asyncFuncs = [];
        for (let x = 0; x < tenantCount; x++) {
            asyncFuncs.push(() => {
                let tenantId = Guid.newGuid();
                let users : UserWithoutAoid[] = Array.from({ length: Gen.Integer(40, 100) }, () => Gen.GenerateuserWithoutAoid(tenantId));                
                console.log('tenant:' + tenantId + ' users:' + users.length);
                return origTable.batchInsertEntity(users);
            })
        }

        asyncFuncs.reduce((prev, curr) => {
            return prev.then(curr);
        }, Promise.resolve())
        .then(() => {
            done();
        },
        (reason) => done(reason));
    }).timeout(0);

    it('Test Copy', (done) => {
        let copy: UserCopy = new UserCopy(origTableSetting, newTableSetting);
        copy.copy()
            .then(() => origUserTable.queryEntities(new TableQuery()))
                .then((result) => {
                    /*result.forEach((user) => { Removed this since we now crate an anonid
                        expect(user.anonimizedOid, 'undefined').is.undefined;
                    })*/
                    return newTable.queryAllUsers();
                })
            .then((res) => {
                res.forEach((user) => {
                    expect(user.anonimizedOid, 'is defined').is.not.undefined;
                    expect(user.anonimizedOid, 'anon check').to.be.a('string').and
                        .to.have.length.above(10).and
                        .is.not.equal(user.oid).and            
                        .is.not.equal(user.tenantId);
                })
            })
            .then(() => done(), (reason) => done(reason))
            .catch((reason) => done(reason))
    }).timeout(0)
});
