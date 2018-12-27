
import {RetryPolicyFilter} from 'azure-storage'

import {EnvironmentType, Environment} from './core/environment'
import {Config} from './Config'
import { TableSetting } from './AzureTable';

export class StorageConfig {
    
    //@AnCommented public static readonly emulatorConnectionString = 'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=base 64 encoded key;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;';
    //连接Table表
    public static readonly emulatorConnectionString = 'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;';
    public static readonly defaultAccountName = "meeservicesstorage";
    public static readonly defaultAccessKey = "base64 encoded key";

    public static readonly devAccountName = "meedevelopment";
    public static readonly devAccessKey = "base 64 encoded key";
    //新用户表设置存储位置
    public static getNewUserTableSettings() {
        let tablename = 'stagingmeeusers';
        if (Environment.getEnvironmentType() == EnvironmentType.Production) {
            tablename = 'meeusers';
        }

        return this.getUserTableSettings(tablename, 'oid');
    }
    //用户表设置存储位置
    public static getUserTableSettings(overrideTableName: string = undefined, overrideRowKeyName :string = undefined) : TableSetting{
        let setting : TableSetting = {} as any;
        let environmentType = Environment.getEnvironmentType();
        console.log('getUserTableSettings: EnvironemtType:' + environmentType)   
        setting.partitionKeyName = 'tenantId';
        setting.rowKeyName = overrideRowKeyName || 'unique_name';
        
        if (Config.useLocalEmulator) {
            /*本地环境的情况下设置*/
            setting.connectionString = StorageConfig.emulatorConnectionString;
            setting.tableName = overrideTableName || 'developmentusers'
        }
        else{//存储位置
            /*开发环境的情况下设置*/
            switch(environmentType) {
                case EnvironmentType.Production:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig.defaultAccessKey;
                    setting.tableName = overrideTableName || 'users';
                    break;
                case EnvironmentType.Staging:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig.defaultAccessKey;
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
    public static getTelemetryTableSettings() : TableSetting{
        let setting : TableSetting = {} as any;
        let environmentType = Environment.getEnvironmentType();

        setting.partitionKeyName = 'Date';
        setting.rowKeyName = 'RandomId';
        if (Config.useLocalEmulator) {
            setting.connectionString = StorageConfig.emulatorConnectionString;
            setting.tableName = 'developmentsignintelemetry'
        }
        else {
            switch(environmentType) {
                case EnvironmentType.Production:
                    setting.accountName = "meetelemetry";
                    setting.accessKey = "base 64 encoded key";
                    setting.tableName = Config.switchToNewSigninTelemetryTable ? 'signindata' : 'signintelemetry';
                    break;
                case EnvironmentType.Staging:
                    setting.accountName = "meetelemetry";
                    setting.accessKey = "base 64 encoded key";
                    setting.tableName = Config.switchToNewSigninTelemetryTable ? 'stagingsignindata' :'stagingsignintelemetry'
                    break;
                default:
                case EnvironmentType.Development:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || "meedevelopment";
                    setting.accessKey = process.env.AZURE_STORAGE_ACCOUNT || "base 64 encoded key";
                    setting.tableName = Config.switchToNewSigninTelemetryTable ?  'developmentsignindata' : 'developmentsignintelemetry'
            }
        }
    
        return setting;
    }
    //付费记录表设置？
    public static getReceiptsTableSettings() : TableSetting{
        let setting : TableSetting = {} as any;
        let environmentType = Environment.getEnvironmentType();

        setting.partitionKeyName = 'anonimizedOid';
        setting.rowKeyName = 'transactionId';
        if (Config.useLocalEmulator) {
            setting.connectionString = StorageConfig.emulatorConnectionString;
            setting.tableName = 'developmentreceipts'
        }
        else {
            switch(environmentType) {
                case EnvironmentType.Production:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig.defaultAccessKey;
                    setting.tableName = 'receiptstable';
                    break;
                case EnvironmentType.Staging:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig.defaultAccessKey;
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