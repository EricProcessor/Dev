import * as Utilities from "./utilities";
import { Environment } from "./core/environment"
import { StorageConfig } from "./StorageConfig"
import { Config } from "./Config"
import { Server } from "http";
// let DBurl = 'mongodb://root:Eq9RQ80J@jmongo-hb1-prod-mongo-t392nvqc112.jmiss.jdcloud.com:27017,jmongo-hb1-prod-mongo-t392nvqc112.jmiss.jdcloud.com:27017/admin';
let DBurl = !Environment.isProduction()?'mongodb://root:Eq9RQ80J@jmongo-hb1-prod-mongo-t392nvqc112.jmiss.jdcloud.com:27017/admin?replicaSet=mgset-2242988359':'mongodb://127.0.0.1:27017';

// let dbName = 'admin';
// let mongo_url = DBurl + dbName;
//引用azure-storage模块                                                                                                                  
// const azure = require("azure-storage");
//数据库引用 
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
//枚举---定义变量                                                                                                                          
export enum Table {
    Users,//用户
    AllowList,//允许列表
    UserGuid,//用户向导
    SigninTelemetry,//登录遥测
    Receipts //收据
}
/*                                                                                                                                   
 *                                                                                                                  
 * Production----生产环境----0                                                                                                           
 * LocalDev----本地开发环境----3                                                                                                           
 * Staging----预发布环境----1                                                                                                             
 */
const development_mode = Environment.isLocalDev();
const isProduction = Environment.isProduction();
const isStaging = Environment.isStaging();
/*                                                                                                                                   
 * 引用StorageConfig方法（根据环境类型切换不同环境的存储空间设置）
 */
//新用户表设置存储位置
const userStorageTable = StorageConfig.getNewUserTableSettings();
//用户数据表设置存储位置
const telemetryTable = StorageConfig.getTelemetryTableSettings();
//付费记录表设置？
const receiptsTable = StorageConfig.getReceiptsTableSettings();
//新用户表设置存储表名称
const userTableName = userStorageTable.tableName;
//用户数据表设置存储表名称
const signinTelemetryTableName = telemetryTable.tableName;
//付费记录表设置表名称
const receiptsTableName = receiptsTable.tableName;

// We haven't ported allowList and userGuid yet.                                                  // 允许列表表名
const allowListTableName = isProduction ? "allowlist" : isStaging ? "stagingallowlist" : "devallowlist";
// 用户指南表名
const userGuidTableName = isProduction ? "userguid" : isStaging ? "staginguserguid" : "devuserguid";


let tableService;
let telemetryTableService;
let receiptsTableService;

// Hacking this together over here. This is moving to the AzureTable stuff. 
// 在这里把这个拼凑起来。这是在转移到可变焦的东西上                                                  //  


if (Config.useLocalEmulator) {
    console.log('Using local emulator');
    //DBurl + "|user"
    tableService = new mongodb.Server(userStorageTable.connectionString);
    //用户数据表设置存储位置
    telemetryTableService = new mongodb.Server(telemetryTable.connectionString);

    receiptsTableService = new mongodb.Server(receiptsTable.connectionString);
}
else {
    //在使用Storage SDK时，必须为存储帐户提供要使用的连接信息 
    //  DBurl + "|user"
    tableService = new mongodb.Server();

    telemetryTableService = new mongodb.Server();

    receiptsTableService = new mongodb.Server();
    // tableService = azure.createTableService(
    //     //配置环境变量                                           
    //     process.env.AZURE_STORAGE_ACCOUNT || userStorageTable.accountName,
    //     process.env.AZURE_STORAGE_ACCESS_KEY || userStorageTable.accessKey);
    // telemetryTableService = azure.createTableService(telemetryTable.accountName, telemetryTable.accessKey)
    // receiptsTableService = azure.createTableService(receiptsTable.accountName, receiptsTable.accessKey)
}

//获取表服务                                                                                      // Users,//用户
// AllowList,//允许列表
// UserGuid,//用户向导
// SigninTelemetry,//登录遥测
// Receipts //收据                                        
function getTableService(table: Table /*Table为开始定义的枚举变量*/) {
    switch (table) {
        case Table.SigninTelemetry:
        case Table.AllowList:
            //用户数据表设置存储位置
            return telemetryTableService;
        case Table.Receipts:
            // 付费记录表设置？
            return receiptsTableService;
        default:
            //用户表设置存储位置
            return tableService;
    }
}
//获取表名称                                                                                      // Users,//用户
// AllowList,//允许列表
// UserGuid,//用户向导
// SigninTelemetry,//登录遥测
// Receipts //收据
function getTableName(table: Table /*Table为开始定义的枚举变量*/) {
    switch (table) {
        case Table.Users:
            // 新用户表设置存储表名称
            return userTableName;
        case Table.AllowList:
            // 允许列表表名
            return allowListTableName;
        case Table.UserGuid:
            //用户指南表明
            return userGuidTableName;
        case Table.SigninTelemetry:
            // 用户数据表设置存储表名称
            return signinTelemetryTableName;
        case Table.Receipts:
            //付费记录表设置表名称
            return receiptsTableName;
        default:
            throw Error("unrecongized table name");
    }
}
/*                                                                                                                                   
 检查Table.Users, Table.AllowList, Table.UserGuid, Table.SigninTelemetry, Table.Receipts是否存在                                           
 * */
// 检查表名称是否存在
[Table.Users, Table.AllowList, Table.UserGuid, Table.SigninTelemetry, Table.Receipts].forEach((table: Table) => {
    // getTableService(table).createTableIfNotExists(getTableName(table), function (error, result, response) {
    //     if (error) {
    //         //退出进程
    //         process.exit(1);
    //     }
    // });
})
//获取刚刚插入表中的实体                                                                                     
export function retrieveEntity(table: Table, partitionKey: string, rowKey: string): Promise<any> {
    return new Promise(function (resolve, reject) {
        getTableService(table).retrieveEntity(getTableName(table), partitionKey, rowKey, function (error, result, response) {
            if (!error) {
                resolve({ valid: true, azureResult: result, azureResponse: response });
            } else {
                resolve({ valid: false });
            }
        });
    });
}
/*                                                                                                                                   
 * TableQuery 类                                                                                                                      
 * 它代表了某个表上的一个查询                                                                                                                     
 */
//它代表了某个表上的一个查询                                                                                               
export function queryEntityRowKey(table: Table, key: string): Promise<any> {
    // var query = new azure.TableQuery()
    //     .top(1)
    //     .where('RowKey eq ?', key);

    var query = { "RowKey": key }
    return queryEntity(table, query);
}
//在某个表上的一个查询 ----在数据库中进行查询                                                                                                           
export function queryEntity(table: Table, query: any): Promise<any> {
    return new Promise(function (resolve, reject) {
        var queryResponseHandler = function (error, result, response) {
            if (!error && result.entries.length > 0) {
                resolve(result.entries[0]);
            } else {
                if (result.continuationToken) {
                    // getTableService(table).queryEntities(getTableName(table), query, result.continuationToken, queryResponseHandler);
                    // 提取连接字符串和TABLE名称---节前
                    let db =
                        MongoClient.connect(getTableService(table), function (err, client) {
                            if (err) {
                                console.log("数据库连接失败");
                                return;
                            }
                            const db = client.db('');
                            db.collection(getTableName(table)).find(query, result.continuationToken, queryResponseHandler)
                        })
                }
                else {
                    resolve([]);
                }
            }
        };

        // getTableService(table).queryEntities(getTableName(table), query, null, queryResponseHandler);
        MongoClient.connect(getTableService(table), function (err, client) {
            if (err) {
                console.log("数据库连接失败");
                return;
            }
            const db = client.db('');
            db.collection(getTableName(table)).find({ query }, null, queryResponseHandler)
        })
    });
}


//在某个表上添加新实体----增                                                      
export function insertEntity(table: Table, entity: any): Promise<any> {
    return new Promise(function (resolve, reject) {
        if (development_mode) {
            console.log("insertEntity: " + JSON.stringify({ "table": getTableName(table), "entity": JSON.stringify(entity) }));
        }
        MongoClient.connect(getTableService(table), function (err, client) {
            if (err) {
                console.log("数据库连接失败");
                return;
            }
            const db = client.db('');
            db.collection(getTableName(table)).insertOne({ entity }, function (error, result, response) {
                try {
                    if (!error) {
                        resolve({ valid: true, azureResult: result, azureResponse: response });
                    } else {
                        throw error;
                    }
                }
                catch (err) {
                    err['entity'] = entity;
                    reject(err);
                }
            })
        })
    });
}
export function updateEntity(table: Table, entity: any): Promise<any> {
    return new Promise(function (resolve, reject) {
        if (development_mode) {
            console.log("updateEntity: " + JSON.stringify({ "table": getTableName(table), "entity": JSON.stringify(entity) }));
        }
        MongoClient.connect(getTableService(table), function (err, client) {
            if (err) {
                console.log("数据库连接失败");
                return;
            }
            const db = client.db('');
            db.collection(getTableName(table)).updateOne({ entity }, function (error, result, response) {
                if (!error) {
                    resolve({ valid: true, azureResult: result, azureResponse: response });
                } else {
                    reject(error);
                }
                client.close();
            })
        })
        // getTableService(table).replaceEntity(getTableName(table), entity, function (error, result, response) {
        //     if (!error) {
        //         resolve({ valid: true, azureResult: result, azureResponse: response });
        //     } else {
        //         reject(error);
        //     }
        // });
    });
}
//删除现有条目----删                                                                                                                        
export function deleteEntity(table: Table, entity: any): Promise<any> {
    return new Promise(function (resolve, reject) {
        if (development_mode) {
            console.log("deleteEntity: " + JSON.stringify({ "table": getTableName(table), "entity": JSON.stringify(entity) }));
        }
        MongoClient.connect(getTableService(table), function (err, client) {
            if (err) {
                console.log("数据库连接失败");
                return;
            }
            const db = client.db('');
            db.collection(getTableName(table)).deleteOne({ entity }, function (error, result, response) {
                if (!error) {
                    console.log('success');
                    resolve({ valid: true, azureResult: result, azureResponse: response });
                } else {
                    reject(error);
                }
            })

        })
        // getTableService(table).deleteEntity(getTableName(table), entity, function (error, result, response) {
        //     if (!error) {
        //         console.log('success');
        //         resolve({ valid: true, azureResult: result, azureResponse: response });
        //     } else {
        //         reject(error);
        //     }
        // });
    });
}                                                                                                                                    