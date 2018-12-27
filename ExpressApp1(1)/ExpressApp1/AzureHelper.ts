/** 
* @author : xin shi
* @date : 2018-12-26
*/
import * as Utilities from "./utilities";
import { Environment } from "./core/environment"                                                                                     
import { StorageConfig } from "./StorageConfig";                                                                                     
import {Config} from "./Config"                                                                                                      
//引用azure-storage模块                                                                                                                  
const azure = require("azure-storage");                                                                                              
                                                                                                                                     
//枚举---定义变量                                                                                                                          
export enum Table {                                                                                                                  
    Users,                                                                                                                           
    AllowList,                                                                                                                       
    UserGuid,                                                                                                                        
    SigninTelemetry,                                                                                                                 
    Receipts                                                                                                                         
}                                                                                                                                    
/*                                                                                                                                   
 * 引用environment里定义方法                                                                                                                
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
const userStorageTable = StorageConfig.getNewUserTableSettings();                                                                    
const telemetryTable = StorageConfig.getTelemetryTableSettings();                                                                    
const receiptsTable = StorageConfig.getReceiptsTableSettings();                                                                      
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
/*                                                                                                                                   
 *Config.useLocalEmulator返回值为false ---代表运行本地测试开发环境                                                                                   
 **/                                                                                                                                 
if (Config.useLocalEmulator) {                                                                                                       
    console.log('Using local emulator');                                                                                             
    tableService = azure.createTableService(userStorageTable.connectionString);                                                      
    telemetryTableService = azure.createTableService(telemetryTable.connectionString);                                               
    receiptsTableService = azure.createTableService(receiptsTable.connectionString);                                                 
}                                                                                                                                    
else {                                                                                                                               
	//在使用Storage SDK时，必须为存储帐户提供要使用的连接信息                                                                                              
    tableService = azure.createTableService(                                                                                         
    	//配置环境变量                                                                                                                     
        process.env.AZURE_STORAGE_ACCOUNT || userStorageTable.accountName,                                                           
        process.env.AZURE_STORAGE_ACCESS_KEY || userStorageTable.accessKey);                                                         
    telemetryTableService = azure.createTableService(telemetryTable.accountName, telemetryTable.accessKey)                           
    receiptsTableService = azure.createTableService(receiptsTable.accountName, receiptsTable.accessKey)                              
}                                                                                                                                    
                                                                                                                                     
//获取表服务                                                                                                                              
function getTableService(table: Table /*Table为开始定义的枚举变量*/) {                                                                         
    switch(table) {                                                                                                                  
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
function getTableName(table: Table /*Table为开始定义的枚举变量*/) {                                                                            
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
[Table.Users, Table.AllowList, Table.UserGuid, Table.SigninTelemetry, Table.Receipts].forEach((table: Table) => {                    
    getTableService(table).createTableIfNotExists(getTableName(table), function (error, result, response) {                          
        if (error) {                                                                                                                 
            process.exit(1);                                                                                                         
        }                                                                                                                            
    });                                                                                                                              
})                                                                                                                                   
//获取来获取刚刚插入表中的实体----抛出retrieveEntity方法                                                                                               
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
    var query = new azure.TableQuery()                                                                                               
    .top(1)                                                                                                                          
    .where('RowKey eq ?', key);                                                                                                      
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
//在某个表上添加新实体----增                                                                                                                    
export function insertEntity(table: Table, entity: any): Promise<any> {                                                              
    return new Promise(function (resolve, reject) {                                                                                  
        if (development_mode) {                                                                                                      
            console.log("insertEntity: " + JSON.stringify({ "table": getTableName(table), "entity": JSON.stringify(entity) }));      
        }                                                                                                                            
                                                                                                                                     
        getTableService(table).insertEntity(getTableName(table), entity, function (error, result, response) {                        
            try {                                                                                                                    
                if (!error) {                                                                                                        
                    resolve({ valid: true, azureResult: result, azureResponse: response });                                          
                } else {                                                                                                             
                    throw error;                                                                                                     
                }                                                                                                                    
            }                                                                                                                        
            catch(err) {                                                                                                             
                err['entity'] = entity;                                                                                              
                reject(err);                                                                                                         
            }                                                                                                                        
        });                                                                                                                          
    });                                                                                                                              
}                                                                                                                                    
//更新/编辑现有条目----改                                                                                                                     
export function updateEntity(table: Table, entity: any): Promise<any> {                                                              
    return new Promise(function (resolve, reject) {                                                                                  
        if (development_mode) {                                                                                                      
            console.log("updateEntity: " + JSON.stringify({ "table": getTableName(table), "entity": JSON.stringify(entity) }));      
        }                                                                                                                            
                                                                                                                                     
        getTableService(table).replaceEntity(getTableName(table), entity, function (error, result, response) {                       
            if (!error) {                                                                                                            
                resolve({ valid: true, azureResult: result, azureResponse: response });                                              
            } else {                                                                                                                 
                reject(error);                                                                                                       
            }                                                                                                                        
        });                                                                                                                          
    });                                                                                                                              
}                                                                                                                                    
//删除现有条目----删                                                                                                                        
export function deleteEntity(table: Table, entity: any): Promise<any> {                                                              
    return new Promise(function (resolve, reject) {                                                                                  
        if (development_mode) {                                                                                                      
            console.log("deleteEntity: " + JSON.stringify({ "table": getTableName(table), "entity": JSON.stringify(entity) }));      
        }                                                                                                                            
                                                                                                                                     
        getTableService(table).deleteEntity(getTableName(table), entity, function (error, result, response) {                        
            if (!error) {                                                                                                            
                console.log('success');                                                                                              
                resolve({ valid: true, azureResult: result, azureResponse: response });                                              
            } else {                                                                                                                 
                reject(error);                                                                                                       
            }                                                                                                                        
        });                                                                                                                          
    });                                                                                                                              
}                                                                                                                                    