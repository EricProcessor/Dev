"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./core/environment");
const Config_1 = require("./Config");
let MongoClient = require('mongodb').MongoClient;
let DBurl = 'mongodb://127.0.0.1:27017/';
let dbName = 'itying';
let mongo_url = DBurl + dbName;
class StorageConfig_mongo {
    //新用户表设置存储位置
    static getNewUserTableSettings() {
        let tablename = 'stagingmeeusers';
        if (environment_1.Environment.getEnvironmentType() == environment_1.EnvironmentType.Production) {
            tablename = 'meeusers';
        }
        return this.getUserTableSettings(tablename, 'oid');
    }
    //用户表设置存储位置
    static getUserTableSettings(overrideTableName = undefined, overrideRowKeyName = undefined) {
        let setting = {};
        let environmentType = environment_1.Environment.getEnvironmentType();
        console.log('getUserTableSettings: EnvironemtType:' + environmentType);
        setting.partitionKeyName = 'tenantId';
        setting.rowKeyName = overrideRowKeyName || 'unique_name';
        if (Config_1.Config.useLocalEmulator) {
            /*本地环境的情况下设置*/
            setting.connectionString = StorageConfig_mongo.emulatorConnectionString;
            setting.tableName = overrideTableName || 'developmentusers';
        }
        else { //存储位置
            /*开发环境的情况下设置*/
            switch (environmentType) {
                case environment_1.EnvironmentType.Production:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig_mongo.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig_mongo.defaultAccessKey;
                    setting.tableName = overrideTableName || 'users';
                    break;
                case environment_1.EnvironmentType.Staging:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig_mongo.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig_mongo.defaultAccessKey;
                    setting.tableName = overrideTableName || 'stagingusers';
                    break;
                default:
                case environment_1.EnvironmentType.Development:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || "meedevelopment";
                    setting.accessKey = process.env.AZURE_STORAGE_ACCOUNT || "base 64 encoded key";
                    setting.tableName = overrideTableName || 'developmentusers';
            }
        }
        return setting;
    }
    //用户数据表设置存储位置
    static getTelemetryTableSettings() {
        let setting = {};
        let environmentType = environment_1.Environment.getEnvironmentType();
        setting.partitionKeyName = 'Date';
        setting.rowKeyName = 'RandomId';
        if (Config_1.Config.useLocalEmulator) {
            setting.connectionString = StorageConfig_mongo.emulatorConnectionString;
            setting.tableName = 'developmentsignintelemetry';
        }
        else {
            switch (environmentType) {
                case environment_1.EnvironmentType.Production:
                    setting.accountName = "meetelemetry";
                    setting.accessKey = "base 64 encoded key";
                    setting.tableName = Config_1.Config.switchToNewSigninTelemetryTable ? 'signindata' : 'signintelemetry';
                    break;
                case environment_1.EnvironmentType.Staging:
                    setting.accountName = "meetelemetry";
                    setting.accessKey = "base 64 encoded key";
                    setting.tableName = Config_1.Config.switchToNewSigninTelemetryTable ? 'stagingsignindata' : 'stagingsignintelemetry';
                    break;
                default:
                case environment_1.EnvironmentType.Development:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || "meedevelopment";
                    setting.accessKey = process.env.AZURE_STORAGE_ACCOUNT || "base 64 encoded key";
                    setting.tableName = Config_1.Config.switchToNewSigninTelemetryTable ? 'developmentsignindata' : 'developmentsignintelemetry';
            }
        }
        return setting;
    }
    //付费记录表设置？
    static getReceiptsTableSettings() {
        let setting = {};
        let environmentType = environment_1.Environment.getEnvironmentType();
        setting.partitionKeyName = 'anonimizedOid';
        setting.rowKeyName = 'transactionId';
        if (Config_1.Config.useLocalEmulator) {
            setting.connectionString = StorageConfig_mongo.emulatorConnectionString;
            setting.tableName = 'developmentreceipts';
        }
        else {
            switch (environmentType) {
                case environment_1.EnvironmentType.Production:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig_mongo.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig_mongo.defaultAccessKey;
                    setting.tableName = 'receiptstable';
                    break;
                case environment_1.EnvironmentType.Staging:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig_mongo.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig_mongo.defaultAccessKey;
                    setting.tableName = 'stagingreceiptstable';
                    break;
                default:
                case environment_1.EnvironmentType.Development:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || "meedevelopment";
                    setting.accessKey = process.env.AZURE_STORAGE_ACCOUNT || "base 64 encoded key";
                    setting.tableName = 'developmentreceiptsdata';
            }
        }
        return setting;
    }
}
StorageConfig_mongo.emulatorConnectionString = mongo_url;
StorageConfig_mongo.defaultAccountName = "meeservicesstorage";
StorageConfig_mongo.defaultAccessKey = "base64 encoded key";
StorageConfig_mongo.devAccountName = "meedevelopment";
StorageConfig_mongo.devAccessKey = "base 64 encoded key";
exports.StorageConfig_mongo = StorageConfig_mongo;
//# sourceMappingURL=StorageConfig_mongo.js.map