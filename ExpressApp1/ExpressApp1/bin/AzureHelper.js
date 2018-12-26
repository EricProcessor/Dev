"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./core/environment");
const StorageConfig_1 = require("./StorageConfig");
const Config_1 = require("./Config");
const azure = require("azure-storage");
const development_mode = environment_1.Environment.isLocalDev();
var Table;
(function (Table) {
    Table[Table["Users"] = 0] = "Users";
    Table[Table["AllowList"] = 1] = "AllowList";
    Table[Table["UserGuid"] = 2] = "UserGuid";
    Table[Table["SigninTelemetry"] = 3] = "SigninTelemetry";
    Table[Table["Receipts"] = 4] = "Receipts";
})(Table = exports.Table || (exports.Table = {}));
const isProduction = environment_1.Environment.isProduction();
const isStaging = environment_1.Environment.isStaging();
const userStorageTable = StorageConfig_1.StorageConfig.getNewUserTableSettings();
const telemetryTable = StorageConfig_1.StorageConfig.getTelemetryTableSettings();
const receiptsTable = StorageConfig_1.StorageConfig.getReceiptsTableSettings();
const userTableName = userStorageTable.tableName;
const signinTelemetryTableName = telemetryTable.tableName;
const receiptsTableName = receiptsTable.tableName;
// We haven't ported allowList and userGuid yet.
const allowListTableName = isProduction ? "allowlist" : isStaging ? "stagingallowlist" : "devallowlist";
const userGuidTableName = isProduction ? "userguid" : isStaging ? "staginguserguid" : "devuserguid";
let tableService;
let telemetryTableService;
let receiptsTableService;
// Hacking this together over here. This is moving to the AzureTable stuff.
if (Config_1.Config.useLocalEmulator) {
    console.log('Using local emulator');
    tableService = azure.createTableService(userStorageTable.connectionString);
    telemetryTableService = azure.createTableService(telemetryTable.connectionString);
    receiptsTableService = azure.createTableService(receiptsTable.connectionString);
}
else {
    tableService = azure.createTableService(process.env.AZURE_STORAGE_ACCOUNT || userStorageTable.accountName, process.env.AZURE_STORAGE_ACCESS_KEY || userStorageTable.accessKey);
    telemetryTableService = azure.createTableService(telemetryTable.accountName, telemetryTable.accessKey);
    receiptsTableService = azure.createTableService(receiptsTable.accountName, receiptsTable.accessKey);
}
function getTableService(table) {
    switch (table) {
        case Table.SigninTelemetry:
        case Table.AllowList:
            return telemetryTableService;
        case Table.Receipts:
            return receiptsTableService;
        default:
            return tableService;
    }
}
function getTableName(table) {
    switch (table) {
        case Table.Users:
            return userTableName;
        case Table.AllowList:
            return allowListTableName;
        case Table.UserGuid:
            return userGuidTableName;
        case Table.SigninTelemetry:
            return signinTelemetryTableName;
        case Table.Receipts:
            return receiptsTableName;
        default:
            throw Error("unrecongized table name");
    }
}
[Table.Users, Table.AllowList, Table.UserGuid, Table.SigninTelemetry, Table.Receipts].forEach((table) => {
    getTableService(table).createTableIfNotExists(getTableName(table), function (error, result, response) {
        if (error) {
            process.exit(1);
        }
    });
});
function retrieveEntity(table, partitionKey, rowKey) {
    return new Promise(function (resolve, reject) {
        getTableService(table).retrieveEntity(getTableName(table), partitionKey, rowKey, function (error, result, response) {
            if (!error) {
                resolve({ valid: true, azureResult: result, azureResponse: response });
            }
            else {
                resolve({ valid: false });
            }
        });
    });
}
exports.retrieveEntity = retrieveEntity;
function queryEntityRowKey(table, key) {
    var query = new azure.TableQuery()
        .top(1)
        .where('RowKey eq ?', key);
    return queryEntity(table, query);
}
exports.queryEntityRowKey = queryEntityRowKey;
function queryEntity(table, query) {
    return new Promise(function (resolve, reject) {
        var queryResponseHandler = function (error, result, response) {
            if (!error && result.entries.length > 0) {
                resolve(result.entries[0]);
            }
            else {
                if (result.continuationToken) {
                    getTableService(table).queryEntities(getTableName(table), query, result.continuationToken, queryResponseHandler);
                }
                else {
                    resolve([]);
                }
            }
        };
        getTableService(table).queryEntities(getTableName(table), query, null, queryResponseHandler);
    });
}
exports.queryEntity = queryEntity;
function insertEntity(table, entity) {
    return new Promise(function (resolve, reject) {
        if (development_mode) {
            console.log("insertEntity: " + JSON.stringify({ "table": getTableName(table), "entity": JSON.stringify(entity) }));
        }
        getTableService(table).insertEntity(getTableName(table), entity, function (error, result, response) {
            try {
                if (!error) {
                    resolve({ valid: true, azureResult: result, azureResponse: response });
                }
                else {
                    throw error;
                }
            }
            catch (err) {
                err['entity'] = entity;
                reject(err);
            }
        });
    });
}
exports.insertEntity = insertEntity;
function updateEntity(table, entity) {
    return new Promise(function (resolve, reject) {
        if (development_mode) {
            console.log("updateEntity: " + JSON.stringify({ "table": getTableName(table), "entity": JSON.stringify(entity) }));
        }
        getTableService(table).replaceEntity(getTableName(table), entity, function (error, result, response) {
            if (!error) {
                resolve({ valid: true, azureResult: result, azureResponse: response });
            }
            else {
                reject(error);
            }
        });
    });
}
exports.updateEntity = updateEntity;
function deleteEntity(table, entity) {
    return new Promise(function (resolve, reject) {
        if (development_mode) {
            console.log("deleteEntity: " + JSON.stringify({ "table": getTableName(table), "entity": JSON.stringify(entity) }));
        }
        getTableService(table).deleteEntity(getTableName(table), entity, function (error, result, response) {
            if (!error) {
                console.log('success');
                resolve({ valid: true, azureResult: result, azureResponse: response });
            }
            else {
                reject(error);
            }
        });
    });
}
exports.deleteEntity = deleteEntity;
//# sourceMappingURL=AzureHelper.js.map