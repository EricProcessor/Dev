"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./core/environment");
const StorageConfig_mongo_1 = require("./StorageConfig_mongo");
const Config_1 = require("./Config");
//引用azure-storage模块                                                                                                                  
const azure = require("azure-storage");
//枚举---定义变量                                                                                                                          
var Table;
(function (Table) {
    Table[Table["Users"] = 0] = "Users";
    Table[Table["AllowList"] = 1] = "AllowList";
    Table[Table["UserGuid"] = 2] = "UserGuid";
    Table[Table["SigninTelemetry"] = 3] = "SigninTelemetry";
    Table[Table["Receipts"] = 4] = "Receipts"; //收据
})(Table = exports.Table || (exports.Table = {}));
/*
 * 引用environment里定义方法
 * Production----生产环境----0
 * LocalDev----本地开发环境----3
 * Staging----预发布环境----1
 */
const development_mode = environment_1.Environment.isLocalDev();
const isProduction = environment_1.Environment.isProduction();
const isStaging = environment_1.Environment.isStaging();
/*
 * 引用StorageConfig_mongo方法（根据环境类型切换不同环境的存储空间设置）
 */
const userStorageTable = StorageConfig_mongo_1.StorageConfig_mongo.getNewUserTableSettings();
const telemetryTable = StorageConfig_mongo_1.StorageConfig_mongo.getTelemetryTableSettings();
const receiptsTable = StorageConfig_mongo_1.StorageConfig_mongo.getReceiptsTableSettings();
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
// 在这里把这个拼凑起来。这是在转移到可变焦的东西上                                                                                                                                                                            //  
if (Config_1.Config.useLocalEmulator) {
    console.log('Using local emulator');
    tableService = azure.createTableService(userStorageTable.connectionString);
    telemetryTableService = azure.createTableService(telemetryTable.connectionString);
    receiptsTableService = azure.createTableService(receiptsTable.connectionString);
}
else {
    //在使用Storage SDK时，必须为存储帐户提供要使用的连接信息                                                                                              
    tableService = azure.createTableService(
    //配置环境变量                                                                                                                     
    process.env.AZURE_STORAGE_ACCOUNT || userStorageTable.accountName, process.env.AZURE_STORAGE_ACCESS_KEY || userStorageTable.accessKey);
    telemetryTableService = azure.createTableService(telemetryTable.accountName, telemetryTable.accessKey);
    receiptsTableService = azure.createTableService(receiptsTable.accountName, receiptsTable.accessKey);
}
//获取表服务                                                                                                                              
function getTableService(table /*Table为开始定义的枚举变量*/) {
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
//获取表名称                                                                                                                              
function getTableName(table /*Table为开始定义的枚举变量*/) {
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
/*
 检查Table.Users, Table.AllowList, Table.UserGuid, Table.SigninTelemetry, Table.Receipts是否存在
 * */
[Table.Users, Table.AllowList, Table.UserGuid, Table.SigninTelemetry, Table.Receipts].forEach((table) => {
    getTableService(table).createTableIfNotExists(getTableName(table), function (error, result, response) {
        if (error) {
            //退出进程
            process.exit(1);
        }
    });
});
//获取刚刚插入表中的实体                                                                                     
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
/*
 * TableQuery 类
 * 它代表了某个表上的一个查询
 */
//它代表了某个表上的一个查询                                                                                               
function queryEntityRowKey(table, key) {
    var query = new azure.TableQuery()
        .top(1)
        .where('RowKey eq ?', key);
    return queryEntity(table, query);
}
exports.queryEntityRowKey = queryEntityRowKey;
//在某个表上的一个查询 ----在数据库中进行查询                                                                                                           
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
//在某个表上添加新实体----增                                                                                                                    
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
//更新/编辑现有条目----改                                                                                                                     
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
//删除现有条目----删                                                                                                                        
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