import { EnvironmentType, Environment } from './core/environment'
import { Config } from './Config'
import { TableSetting } from './AzureTable'
//let DBurl = !Environment.isProduction()?'mongodb://root:Eq9RQ80J@jmongo-hb1-prod-mongo-t392nvqc111.jmiss.jdcloud.com:27017,jmongo-hb1-prod-mongo-t392nvqc112.jmiss.jdcloud.com:27017/admin?replicaSet=mgset-2242988359':'mongodb://127.0.0.1:27017';

let UserName = process.env.UserName;
let Password = process.env.Password;
let JdMongoUrl = process.env.JdMongoUrl;
let dbUrl = !Environment.isProduction()?'mongodb://'+UserName+':'+Password+'@'+JdMongoUrl+'/admin?replicaSet=mgset-2242988359':'mongodb://127.0.0.1:27017';

 
export class StorageConfig {
    public static readonly emulatorConnectionString = dbUrl;
    public static readonly defaultAccountName = "meeservicesstorage";
    public static readonly defaultAccessKey = "base64 encoded key";
    public static readonly devAccountName = "meedevelopment";
    public static readonly devAccessKey = "base 64 encoded key";

    //新用户表设置存储位置
    public static getNewUserTableSettings() {
        // let tablename = 'stagingmeeusers';      //本地开发环境、测试、开发环境  中的用的数据表名称
        let tablename = "User"      //暂时改成 User
        if (Environment.getEnvironmentType() == EnvironmentType.Production) {
            // tablename = 'meeusers';         //产出 - 线上环境 用的 数据库表名称
            tablename = "User"      //暂时都改成User
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
            setting.connectionString = StorageConfig.emulatorConnectionString;
            setting.tableName = overrideTableName || 'developmentusers'
        }
        else {//存储位置
            /*开发环境的情况下设置*/
            // switch (environmentType) {
            //     //生产
            //     case EnvironmentType.Production:         //存储账户
            //         setting.tableName = overrideTableName || 'users';
            //         break;
            //     //测试
            //     case EnvironmentType.Staging:
            //         setting.tableName = overrideTableName || 'stagingusers'
            //         break;
            //     default:
            //     //开发
            //     case EnvironmentType.Development:
            //         setting.tableName = overrideTableName || 'developmentusers'
            // }
            setting.tableName = overrideTableName || 'User'
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
            setting.connectionString = StorageConfig.emulatorConnectionString;
            setting.tableName = 'developmentsignintelemetry'
        }
        else {
            switch (environmentType) {
                case EnvironmentType.Production:
                    setting.tableName = Config.switchToNewSigninTelemetryTable ? 'signindata' : 'signintelemetry';
                    break;
                case EnvironmentType.Staging:
                    setting.tableName = Config.switchToNewSigninTelemetryTable ? 'stagingsignindata' : 'stagingsignintelemetry'
                    break;
                default:
                case EnvironmentType.Development:
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
            setting.connectionString = StorageConfig.emulatorConnectionString;
            setting.tableName = 'developmentreceipts'
        }
        else {
            switch (environmentType) {
                case EnvironmentType.Production:
                    setting.tableName = 'receiptstable';
                    break;
                case EnvironmentType.Staging:
                    setting.tableName = 'stagingreceiptstable';
                    break;
                default:
                case EnvironmentType.Development:
                    setting.tableName = 'developmentreceiptsdata';
            }
        }

        return setting;
    }
}