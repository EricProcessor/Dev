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
const MeeUserTable_1 = require("../MeeUserTable");
const azure_storage_1 = require("azure-storage");
const guid_1 = require("../core/guid");
const Config_1 = require("../Config");
const entityConverter_1 = require("../core/entityConverter");
const StorageConfig_1 = require("../StorageConfig");
const environment_1 = require("../core/environment");
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
function splitBy(size, list) {
    return list.reduce((acc, curr, index, arr) => {
        if (!(index % size)) {
            return [...acc, arr.slice(index, index + size)];
        }
        return acc;
    }, []);
}
class UserCopy {
    constructor(orginalTableSetting, newTableSetting, readFromNewTable = false) {
        this.processedCount = 0;
        this.writtenCount = 0;
        this.originalTable = new MeeUserTable_1.UserTable(orginalTableSetting);
        this.newTable = new MeeUserTable_1.UserTable(newTableSetting);
    }
    createBatchFromEntities(list) {
        return __awaiter(this, void 0, void 0, function* () {
            // Process all entities from original table and map them to a User class
            const entities = list.entries.map(m => entityConverter_1.EntityConverter.map(m));
            this.processedCount += entities.length;
            // Make sure we have entities
            if (entities.length > 0) {
                // Group all entities. We can use the missing anonimizedOid as a tool to catch all entites.
                // The other options were to just query the other table or just merge.
                let group = groupBy(entities, (cond) => !cond.anonimizedOid && cond.oid, (mod) => {
                    mod.anonimizedOid = guid_1.Guid.newGuid();
                    return mod;
                }, (selector) => selector.tenantId);
                let asyncFuncs = [];
                console.log('Read:' + this.processedCount);
                group.forEach((tenant) => {
                    let sessionID = guid_1.Guid.newGuid();
                    let split = splitBy(100, tenant);
                    split.forEach(val => {
                        // There are chances that the oid is duplicated. This happens when unique_names are used as the rowkey.
                        val = val.filter((value, index, array) => !array.filter((v, i) => v.oid == value.oid && (i < index)).length);
                        this.writtenCount += val.length;
                        console.log(' Write:' + this.writtenCount);
                        asyncFuncs.push(() => this.newTable.batchInsertEntity(val).then(r => r, (reason) => {
                            console.log('Batching issue with copy: ' + reason);
                            val.forEach(out => console.log('TID:' + out.tenantId + '  OID:' + out.oid + 'unique_name:' + out.unique_name));
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
                // Process all entities from original table and map them to a User class
                yield this.createBatchFromEntities(result);
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
exports.UserCopy = UserCopy;
if (process.argv.length === 3) {
    let targetEnv = process.argv[2].toLowerCase();
    if (targetEnv.match('development')) {
        Config_1.Config.environmentOverride = environment_1.EnvironmentType.Development;
        let origTableSetting = StorageConfig_1.StorageConfig.getUserTableSettings();
        let newTableSetting = StorageConfig_1.StorageConfig.getNewUserTableSettings();
        console.log('Starting Development');
        console.log('   orignaltable:' + origTableSetting.tableName + ' ConnectionString:' + origTableSetting.connectionString + ' AccountName:' + origTableSetting.accountName);
        console.log('   newtable:' + newTableSetting.tableName + ' ConnectionString:' + newTableSetting.connectionString + ' AccountName:' + newTableSetting.accountName);
        let copy = new UserCopy(origTableSetting, newTableSetting);
        copy.copy();
    }
    else if (targetEnv.match('staging')) {
        Config_1.Config.environmentOverride = environment_1.EnvironmentType.Staging;
        let origTableSetting = StorageConfig_1.StorageConfig.getUserTableSettings();
        let newTableSetting = StorageConfig_1.StorageConfig.getNewUserTableSettings();
        console.log('Starting staging');
        console.log('   orignaltable:' + origTableSetting.tableName + ' ConnectionString:' + origTableSetting.connectionString + ' AccountName:' + origTableSetting.accountName);
        console.log('   newtable:' + newTableSetting.tableName + ' ConnectionString:' + newTableSetting.connectionString + ' AccountName:' + newTableSetting.accountName);
        let copy = new UserCopy(origTableSetting, newTableSetting);
        copy.copy();
    }
    else if (targetEnv.match('production')) {
        Config_1.Config.environmentOverride = environment_1.EnvironmentType.Production;
        let origTableSetting = StorageConfig_1.StorageConfig.getUserTableSettings();
        let newTableSetting = StorageConfig_1.StorageConfig.getNewUserTableSettings();
        console.log('Starting staging');
        console.log('   orignaltable:' + origTableSetting.tableName + ' ConnectionString:' + origTableSetting.connectionString + ' AccountName:' + origTableSetting.accountName);
        console.log('   newtable:' + newTableSetting.tableName + ' ConnectionString:' + newTableSetting.connectionString + ' AccountName:' + newTableSetting.accountName);
        let copy = new UserCopy(origTableSetting, newTableSetting);
        copy.copy();
    }
}
//# sourceMappingURL=UserCopy.js.map