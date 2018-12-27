import { EnvironmentType, Environment } from './core/environment'
import { Config } from './Config'
import { TableSetting } from './AzureTable';
let MongoClient = require('mongodb').MongoClient;
let DBurl = 'mongodb://127.0.0.1:27017/';
let dbName = 'itying';
let mongo_url = DBurl + dbName;
export class StorageConfig_mongo {
    public static readonly emulatorConnectionString = mongo_url;
    public static readonly defaultAccountName = "meeservicesstorage";
    public static readonly defaultAccessKey = "base64 encoded key";
    public static readonly devAccountName = "meedevelopment";
    public static readonly devAccessKey = "base 64 encoded key";

    linkMongo() {//连接数据库
        MongoClient.connect(StorageConfig_mongo.emulatorConnectionString, function (err, client) {
            if (err) {
                console.log('连接数据库失败');
                return;
            }
            let db = client.db(dbName);
            //查询数据
            var list = [];  /*放数据库里面查询的所有数据*/

            var result = db.collection('user').find({});
            result.each(function (error, doc) {
                // console.log(doc);
                if (error) {
                    console.log(error);
                } else {
                    if (doc != null) {
                        list.push(doc);
                    } else {  /*doc==null表示数据循环完成*/
                        /*获取数据以后*/
                        return list;
                    }

                }

            })
            //console.log(result);

        })
    }
    //新用户表设置存储位置
    public static getNewUserTableSettings() {
        let tablename = 'stagingmeeusers';
        if (Environment.getEnvironmentType() == EnvironmentType.Production) {
            tablename = 'meeusers';
        }

        return this.getUserTableSettings(tablename, 'oid');
    }
    //用户表设置存储位置
    public static getUserTableSettings(overrideTableName: string = undefined, overrideRowKeyName: string = undefined): TableSetting {
        let setting: TableSetting = {} as any;
        let environmentType = Environment.getEnvironmentType();
        console.log('getUserTableSettings: EnvironemtType:' + environmentType)
        setting.partitionKeyName = 'tenantId';
        setting.rowKeyName = overrideRowKeyName || 'unique_name';

        if (Config.useLocalEmulator) {
            /*本地环境的情况下设置*/
            setting.connectionString = StorageConfig_mongo.emulatorConnectionString;
            setting.tableName = overrideTableName || 'developmentusers'
        }
        else {//存储位置
            /*开发环境的情况下设置*/
            switch (environmentType) {
                case EnvironmentType.Production:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig_mongo.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig_mongo.defaultAccessKey;
                    setting.tableName = overrideTableName || 'users';
                    break;
                case EnvironmentType.Staging:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig_mongo.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig_mongo.defaultAccessKey;
                    setting.tableName = overrideTableName || 'stagingusers'
                    break;
                default:
                case EnvironmentType.Development:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || "meedevelopment";
                    setting.accessKey = process.env.AZURE_STORAGE_ACCOUNT || "base 64 encoded key";
                    setting.tableName = overrideTableName || 'developmentusers'
            }
        }

        return setting;
    }
    //用户数据表设置存储位置
    public static getTelemetryTableSettings(): TableSetting {
        let setting: TableSetting = {} as any;
        let environmentType = Environment.getEnvironmentType();

        setting.partitionKeyName = 'Date';
        setting.rowKeyName = 'RandomId';
        if (Config.useLocalEmulator) {
            setting.connectionString = StorageConfig_mongo.emulatorConnectionString;
            setting.tableName = 'developmentsignintelemetry'
        }
        else {
            switch (environmentType) {
                case EnvironmentType.Production:
                    setting.accountName = "meetelemetry";
                    setting.accessKey = "base 64 encoded key";
                    setting.tableName = Config.switchToNewSigninTelemetryTable ? 'signindata' : 'signintelemetry';
                    break;
                case EnvironmentType.Staging:
                    setting.accountName = "meetelemetry";
                    setting.accessKey = "base 64 encoded key";
                    setting.tableName = Config.switchToNewSigninTelemetryTable ? 'stagingsignindata' : 'stagingsignintelemetry'
                    break;
                default:
                case EnvironmentType.Development:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || "meedevelopment";
                    setting.accessKey = process.env.AZURE_STORAGE_ACCOUNT || "base 64 encoded key";
                    setting.tableName = Config.switchToNewSigninTelemetryTable ? 'developmentsignindata' : 'developmentsignintelemetry'
            }
        }

        return setting;
    }
    //付费记录表设置？
    public static getReceiptsTableSettings(): TableSetting {
        let setting: TableSetting = {} as any;
        let environmentType = Environment.getEnvironmentType();

        setting.partitionKeyName = 'anonimizedOid';
        setting.rowKeyName = 'transactionId';
        if (Config.useLocalEmulator) {
            setting.connectionString = StorageConfig_mongo.emulatorConnectionString;
            setting.tableName = 'developmentreceipts'
        }
        else {
            switch (environmentType) {
                case EnvironmentType.Production:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig_mongo.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig_mongo.defaultAccessKey;
                    setting.tableName = 'receiptstable';
                    break;
                case EnvironmentType.Staging:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig_mongo.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig_mongo.defaultAccessKey;
                    setting.tableName = 'stagingreceiptstable';
                    break;
                default:
                case EnvironmentType.Development:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || "meedevelopment";
                    setting.accessKey = process.env.AZURE_STORAGE_ACCOUNT || "base 64 encoded key";
                    setting.tableName = 'developmentreceiptsdata';
            }
        }

        return setting;
    }
}

