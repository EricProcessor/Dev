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
const Config_1 = require("../Config");
const entityConverter_1 = require("../core/entityConverter");
const StorageConfig_1 = require("../StorageConfig");
const environment_1 = require("../core/environment");
const RandomGenerator_1 = require("./RandomGenerator");
if (process.argv.length === 3) {
    let targetEnv = process.argv[2].toLowerCase();
    if (targetEnv.match('development')) {
        Config_1.Config.environmentOverride = environment_1.EnvironmentType.Development;
    }
    else if (targetEnv.match('staging')) {
        Config_1.Config.environmentOverride = environment_1.EnvironmentType.Staging;
    }
    else if (targetEnv.match('production')) {
        Config_1.Config.environmentOverride = environment_1.EnvironmentType.Production;
    }
    else {
        console.log('No target environment chosen. Quitting.');
        process.exit();
    }
}
else {
    console.log('No target environment chosen. Quitting.');
    process.exit();
}
let origTableSetting = StorageConfig_1.StorageConfig.getUserTableSettings();
console.log('Environemnt:' + Config_1.Config.environmentOverride);
console.log('   Table Settings:' + origTableSetting.tableName);
console.log('   Connection Settings:' + origTableSetting.connectionString);
console.log('   AccountName:' + origTableSetting.accountName);
let table = new MeeUserTable_1.UserTable(origTableSetting);
let currentQueryCount = 0;
let totalCount = 0;
let Gen = new RandomGenerator_1.RandomGenerator();
function query() {
    return __awaiter(this, void 0, void 0, function* () {
        let query = new azure_storage_1.TableQuery();
        return new Promise((resolve, reject) => queryTillEnd(query, null, resolve, reject));
    });
}
function handleQuery(error, result, response, query, resolve, reject) {
    return __awaiter(this, void 0, void 0, function* () {
        if (error) {
            reject(error);
        }
        else {
            if (Gen.Integer(0, 100) > 80) {
                console.log('Total Users:' + totalCount + ' Current Query:' + currentQueryCount);
            }
            const entities = result.entries.map(m => entityConverter_1.EntityConverter.map(m));
            totalCount += entities.length;
            entities.forEach((user) => {
                if (!user.oid) {
                    currentQueryCount++;
                }
            });
            if (result.continuationToken) {
                queryTillEnd(query, result.continuationToken, resolve, reject);
            }
            else {
                resolve();
            }
        }
    });
}
function queryTillEnd(query, currentToken, resolve, reject) {
    return __awaiter(this, void 0, void 0, function* () {
        // Query will return 1000 entities at a time
        table.query(query, currentToken, (error, result, response) => handleQuery(error, result, response, query, resolve, reject));
    });
}
query().then(() => console.log('Completed: Total Users:' + totalCount + ' Current Query:' + currentQueryCount));
//# sourceMappingURL=QueryUsers.js.map