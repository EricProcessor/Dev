"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./core/environment");
const Config_1 = require("./Config");
class StorageConfig {
    static getNewUserTableSettings() {
        let tablename = 'stagingmeeusers';
        if (environment_1.Environment.getEnvironmentType() == environment_1.EnvironmentType.Production) {
            tablename = 'meeusers';
        }
        return this.getUserTableSettings(tablename, 'oid');
    }
    static getUserTableSettings(overrideTableName = undefined, overrideRowKeyName = undefined) {
        let setting = {};
        let environmentType = environment_1.Environment.getEnvironmentType();
        console.log('getUserTableSettings: EnvironemtType:' + environmentType);
        setting.partitionKeyName = 'tenantId';
        setting.rowKeyName = overrideRowKeyName || 'unique_name';
        if (Config_1.Config.useLocalEmulator) {
            setting.connectionString = StorageConfig.emulatorConnectionString;
            setting.tableName = overrideTableName || 'developmentusers';
        }
        else {
            switch (environmentType) {
                case environment_1.EnvironmentType.Production:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig.defaultAccessKey;
                    setting.tableName = overrideTableName || 'users';
                    break;
                case environment_1.EnvironmentType.Staging:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig.defaultAccessKey;
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
    static getTelemetryTableSettings() {
        let setting = {};
        let environmentType = environment_1.Environment.getEnvironmentType();
        setting.partitionKeyName = 'Date';
        setting.rowKeyName = 'RandomId';
        if (Config_1.Config.useLocalEmulator) {
            setting.connectionString = StorageConfig.emulatorConnectionString;
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
    static getReceiptsTableSettings() {
        let setting = {};
        let environmentType = environment_1.Environment.getEnvironmentType();
        setting.partitionKeyName = 'anonimizedOid';
        setting.rowKeyName = 'transactionId';
        if (Config_1.Config.useLocalEmulator) {
            setting.connectionString = StorageConfig.emulatorConnectionString;
            setting.tableName = 'developmentreceipts';
        }
        else {
            switch (environmentType) {
                case environment_1.EnvironmentType.Production:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig.defaultAccessKey;
                    setting.tableName = 'receiptstable';
                    break;
                case environment_1.EnvironmentType.Staging:
                    setting.accountName = process.env.AZURE_STORAGE_ACCOUNT || StorageConfig.defaultAccountName;
                    setting.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY || StorageConfig.defaultAccessKey;
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
//@AnCommented public static readonly emulatorConnectionString = 'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=base 64 encoded key;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;';
StorageConfig.emulatorConnectionString = 'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;';
StorageConfig.defaultAccountName = "meeservicesstorage";
StorageConfig.defaultAccessKey = "base64 encoded key";
StorageConfig.devAccountName = "meedevelopment";
StorageConfig.devAccessKey = "base 64 encoded key";
exports.StorageConfig = StorageConfig;
//# sourceMappingURL=StorageConfig.js.map