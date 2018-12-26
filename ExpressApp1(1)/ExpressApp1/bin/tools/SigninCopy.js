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
const AzureTable_1 = require("../AzureTable");
const MeeUserTable_1 = require("../MeeUserTable");
const azure_storage_1 = require("azure-storage");
const az = require("azure-storage");
const Config_1 = require("../Config");
const StorageConfig_1 = require("../StorageConfig");
const environment_1 = require("../core/environment");
const MeeSignInTable_1 = require("../MeeSignInTable");
const RandomGenerator_1 = require("./RandomGenerator");
function groupBy(array, condition, modifier, selector) {
    var groups = {};
    array.forEach(function (o) {
        if (condition(o)) {
            var group = JSON.stringify(selector(o));
            groups[group] = groups[group] || [];
            o = modifier(o);
            groups[group].push(o);
        }
    });
    return Object.keys(groups).map(function (group) {
        return groups[group];
    });
}
var anonIdCache = {};
/**
 *
 * @param telm
 * @param anonid
 */
function convertOldSigninToNew(telm, anonid) {
    let value = {};
    value.Date = telm.Date;
    value.RandomId = telm.RandomId;
    value.AnonomizedUserId = anonid;
    value.TenantId = telm.OMSTentantId;
    value.Application = telm.ClientType;
    value.OSPlatform = telm.OSPlatform;
    value.OSVersion = telm.OSVersion;
    value.IsLicensed = telm.IsLicensed;
    value.LicenseType = telm.LicenseType;
    value.Role = telm.Role;
    value.IsNewUser = telm.IsNewUser;
    value.IsWhiteListed = telm.IsWhiteListed;
    value.Skin = telm.Skin;
    value.RemainingTrials = telm.RemainingTrials;
    return value;
}
let hits = 0;
let misses = 0;
let sizeOfCache = 0;
let timeSpentMakingCalls = 0;
/**
 * Groups by Date, and creates SignInTelemetry
 * @param array
 * @param table
 */
function CustomGroupBy(array, table) {
    return __awaiter(this, void 0, void 0, function* () {
        var groups = {};
        for (let i = 0; i < array.length; i++) {
            let o = array[i];
            if (!!o.OMSUserId && !!o.OMSTentantId) {
                var groupKey = JSON.stringify(o.Date);
                groups[groupKey] = groups[groupKey] || [];
                // Try to get anon id
                let anonId = anonIdCache[o.OMSUserId];
                if (!anonId) {
                    misses++;
                    // Looks like we have not seen it before. Look up the UserTable
                    let userId = {};
                    {
                        userId.tenantId = o.OMSTentantId;
                        userId.oid = o.OMSUserId;
                    }
                    let t0 = process.hrtime();
                    let entity = yield table.get(userId).then((result) => {
                        timeSpentMakingCalls += duration(t0);
                        return result;
                    });
                    if (entity.exists && !!entity.entity.anonimizedOid) {
                        sizeOfCache++;
                        anonIdCache[o.OMSUserId] = entity.entity.anonimizedOid;
                        anonId = entity.entity.anonimizedOid;
                    }
                }
                else {
                    hits++;
                }
                if (anonId) {
                    // We found our id lets create the new signin table
                    let conv = convertOldSigninToNew(o, anonId);
                    groups[groupKey].push(conv);
                }
            }
        }
        return Object.keys(groups).map(function (group) {
            return groups[group];
        });
    });
}
function splitBy(size, list) {
    return list.reduce((acc, curr, index, arr) => {
        if (!(index % size)) {
            return [...acc, arr.slice(index, index + size)];
        }
        return acc;
    }, []);
}
let Gen = new RandomGenerator_1.RandomGenerator();
function duration(start) {
    var end = process.hrtime(start);
    return Math.round((end[0] * 1000) + (end[1] / 1000000));
}
class SignInTelemetryCopy {
    constructor(orginalTableSetting, newTableSetting, userTable) {
        this.processedCount = 0;
        this.writtenCount = 0;
        this.timesCalledCustomGroupBy = 0;
        this.timeSpentCustomGroupBy = 0;
        this.timeCalledCreateBatchFromEntities = 0;
        this.timeSpentCreateBatchFromEntities = 0;
        this.originalTable = new AzureTable_1.AzureTable(orginalTableSetting);
        this.newTable = new MeeSignInTable_1.SignInTelemetryTable(newTableSetting);
        this.userTable = userTable;
    }
    cmap(entity) {
        var mapped = {};
        Object.keys(entity).forEach((key) => {
            var prop = entity[key];
            if (key == 'PartitionKey') {
                mapped.Date = prop._;
            }
            else if (key == 'RowKey') {
                mapped.RandomId = prop._;
            }
            else {
                mapped[key] = prop ? prop._ : null;
            }
        });
        return mapped;
    }
    createBatchFromEntities(origTableList) {
        return __awaiter(this, void 0, void 0, function* () {
            // Process all entities from original table and map them to a User class
            const entities = origTableList.entries.map(m => this.cmap(m));
            this.processedCount += entities.length;
            // Make sure we have entities to process
            if (entities.length > 0) {
                this.timesCalledCustomGroupBy++;
                let t0 = process.hrtime();
                let convertedEntities = yield CustomGroupBy(entities, this.userTable);
                this.timeSpentCustomGroupBy += duration(t0);
                if (Gen.Integer(0, 100) > 80) {
                    this.displayStats();
                }
                let asyncFuncs = [];
                convertedEntities.forEach((telm) => {
                    let split = splitBy(100, telm);
                    split.forEach(val => {
                        // There are chances that the oid is duplicated. This happens when unique_names are used as the rowkey.
                        val = val.filter((value, index, array) => !array.filter((v, i) => v.RandomId == value.RandomId && (i < index)).length);
                        this.writtenCount += val.length;
                        asyncFuncs.push(() => this.newTable.batchInsertEntity(val).then(r => r, (reason) => {
                            console.log('Batching issue with copy: ' + reason);
                            val.forEach(out => console.log('PKEY:' + out.Date + '  RKEY:' + out.RandomId + 'Tenant:' + out.TenantId));
                            throw reason;
                        }));
                    });
                });
                // Create a promise chain that will run synchronously. We don't want to cause a large impact to the table.
                return asyncFuncs.reduce((prev, curr) => {
                    return prev.then(curr, (reason) => {
                        console.log('Batching issue with copy: ' + reason);
                        throw reason;
                    });
                }, Promise.resolve());
            }
        });
    }
    displayStats() {
        console.log('Read:' + this.processedCount);
        console.log(' Write:' + this.writtenCount + ' Hits/Misses: ' + hits + '//' + misses + ' SizeOfCache: ' + sizeOfCache);
        console.log(' TimeSpent:');
        console.log('   Making gets:' + timeSpentMakingCalls + ' ms (Misses: ' + misses + ' Average: ' + timeSpentMakingCalls / misses);
        console.log('   CustomGroupBy:' + this.timeSpentCustomGroupBy + ' ms (Calls: ' + this.timesCalledCustomGroupBy + ' Average: ' + this.timeSpentCustomGroupBy / this.timesCalledCustomGroupBy);
        console.log('   CreateBatch:' + this.timeSpentCreateBatchFromEntities + ' ms (Calls: ' + this.timeCalledCreateBatchFromEntities + ' Average: ' + this.timeSpentCreateBatchFromEntities / this.timeCalledCreateBatchFromEntities);
    }
    copy() {
        let query = new azure_storage_1.TableQuery();
        return new Promise((resolve, reject) => this.copyTillEnd(query, null, resolve, reject));
    }
    handleQuery(error, result, response, query, resolve, reject) {
        return __awaiter(this, void 0, void 0, function* () {
            if (error) {
                reject(error);
            }
            else {
                let t0 = process.hrtime();
                // Process all entities from original table and map them to a User class
                yield this.createBatchFromEntities(result);
                this.timeSpentCreateBatchFromEntities = duration(t0);
                this.timeCalledCreateBatchFromEntities++;
                if (result.continuationToken) {
                    this.copyTillEnd(query, result.continuationToken, resolve, reject);
                }
                else {
                    resolve();
                }
            }
        });
    }
    copyTillEnd(query, currentToken, resolve, reject) {
        return __awaiter(this, void 0, void 0, function* () {
            // Query will return 1000 entities at a time
            this.originalTable.query(query, currentToken, (error, result, response) => this.handleQuery(error, result, response, query, resolve, reject));
        });
    }
}
exports.SignInTelemetryCopy = SignInTelemetryCopy;
function entityResolver(en) {
    const r = {};
    for (let k in en) {
        if (k == 'PartitionKey') {
            r['Date'] = en[k]._;
        }
        else if (k == 'RowKey') {
            r['RandomId'] = en[k]._;
        }
        else {
            r[k] = en[k]._;
        }
    }
    return r;
}
if (process.argv.length === 3) {
    let targetEnv = process.argv[2].toLowerCase();
    let userTableSetting = StorageConfig_1.StorageConfig.getNewUserTableSettings();
    let origTableSetting = StorageConfig_1.StorageConfig.getTelemetryTableSettings();
    origTableSetting.entityResolver = entityResolver;
    let newTableSetting = StorageConfig_1.StorageConfig.getTelemetryTableSettings();
    userTableSetting.retryPolicy = new az.LinearRetryPolicyFilter(5, 500);
    origTableSetting.retryPolicy = new az.LinearRetryPolicyFilter(5, 500);
    newTableSetting.retryPolicy = new az.LinearRetryPolicyFilter(5, 500);
    if (targetEnv.match('development')) {
        Config_1.Config.environmentOverride = environment_1.EnvironmentType.Development;
        userTableSetting.tableName = "users";
        userTableSetting.connectionString = undefined;
        userTableSetting.accountName = StorageConfig_1.StorageConfig.defaultAccountName;
        userTableSetting.accessKey = StorageConfig_1.StorageConfig.defaultAccessKey;
        origTableSetting.tableName = "signintelemetry";
        origTableSetting.connectionString = undefined;
        origTableSetting.accountName = StorageConfig_1.StorageConfig.devAccountName;
        origTableSetting.accessKey = StorageConfig_1.StorageConfig.devAccessKey;
        newTableSetting.tableName = "developmenttelemetry";
        newTableSetting.connectionString = undefined;
        newTableSetting.accountName = StorageConfig_1.StorageConfig.devAccountName;
        newTableSetting.accessKey = StorageConfig_1.StorageConfig.devAccessKey;
        console.log('Starting Development');
        console.log('   orignaltable:' + origTableSetting.tableName + ' ConnectionString:' + origTableSetting.connectionString + ' AccountName:' + origTableSetting.accountName);
        console.log('   newtable:' + newTableSetting.tableName + ' ConnectionString:' + newTableSetting.connectionString + ' AccountName:' + newTableSetting.accountName);
        console.log('   usertable:' + userTableSetting.tableName + ' ConnectionString:' + userTableSetting.connectionString + ' AccountName:' + userTableSetting.accountName);
        let copy = new SignInTelemetryCopy(origTableSetting, newTableSetting, new MeeUserTable_1.UserTable(userTableSetting));
        let startTime = process.hrtime();
        copy.copy().then(() => {
            copy.displayStats();
            console.log('Duration: ' + duration(startTime) + 'ms');
        });
    }
    /*
    else if (targetEnv.match('staging')) {
        Config.environmentOverride = EnvironmentType.Staging;
        console.log('Starting staging');
        console.log('   orignaltable:' + origTableSetting.tableName + ' ConnectionString:' + origTableSetting.connectionString + ' AccountName:' + origTableSetting.accountName);
        console.log('   newtable:' + newTableSetting.tableName + ' ConnectionString:' + newTableSetting.connectionString + ' AccountName:' + newTableSetting.accountName);
        console.log('   usertable:' + userTableSetting.tableName + ' ConnectionString:' + userTableSetting.connectionString + ' AccountName:' + userTableSetting.accountName);
        let copy: SignInTelemetryCopy = new SignInTelemetryCopy(origTableSetting, newTableSetting, new UserTable(userTableSetting));
        copy.copy();
    }*/
}
//# sourceMappingURL=SigninCopy.js.map