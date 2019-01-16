// const azure = require("azure-storage");
// const entGen = azure.TableUtilities.entityGenerator;
import * as Utilities from "./utilities";
import * as MEEServices from "./MEEServices";
import { Environment } from "./core/environment"
import { Config } from "./Config";
const http = require('http');
const developer_mode = Environment.isLocalDev();
const logInDeveloperMode: boolean = true;
const uuid = require("uuid");
let mongodb = require('mongodb');
let MongoClient = mongodb.MongoClient;
// let DBurl = 'mongodb://root:Eq9RQ80J@jmongo-hb1-prod-mongo-t392nvqc112.jmiss.jdcloud.com:27017,jmongo-hb1-prod-mongo-t392nvqc112.jmiss.jdcloud.com:27017/admin';
let DBurl = !Environment.isProduction()?'mongodb://root:Eq9RQ80J@jmongo-hb1-prod-mongo-t392nvqc112.jmiss.jdcloud.com:27017,jmongo-hb1-prod-mongo-t392nvqc112.jmiss.jdcloud.com:27017/admin':'mongodb://127.0.0.1:27017';

var options = {
    auto_reconnect: true,
    useNewUrlParser: true,
    poolSize: 20
};
/*
    Azure 模块读取环境变量 AZURE_STORAGE_ACCOUNT 和 AZURE_STORAGE_ACCESS_KEY 
    或 AZURE_STORAGE_CONNECTION_STRING 以获取连接到 Azure 存储器帐户所需的信息。 
    如果未设置这些环境变量，则必须在调用 TableService 时指定帐户信息

    const tableService = azure.createTableService(
        process.env.AZURE_STORAGE_ACCOUNT    || "meeservicesstorage",
        process.env.AZURE_STORAGE_ACCESS_KEY || "uGGiCXyOCwbFrYXQ4ga03X/C0TAQZTC/4vreChUEBtSDdbJI5FEHZAFlQUQJky6itOtZDMrjZ7FHkp6/D1hCZA==");
*/
// const tableService = new mongodb.Server(DBurl, 27017, { auto_reconnect: true });//auto_reconnect: true 连接异常自动重连
const tableService = "Table" //设置数据库名称
//Environment.isProduction()（枚举类型父类方法）通过这个方法返回的ture或false
const activityTableName = Environment.isProduction() ? "diagnosticlogs" : "stagingdiagnosticlogs";

/* 判断该表是否存在 不存在-创建
    tableService.createTableIfNotExists(activityTableName, function(error, result, response) {
        if (error) {
            process.exit(1);
        }
    });
*/

/*
logActivityVerbose
代码不报错,运行崩溃时可以用log打印出信息,以便确定哪里出bug
Log有五种类型
1.verbose 输出颜色为黑色    Log.v(tag,msg);
2.debug   输出颜色为蓝色    Log.d(tag,msg);
3.info    输出颜色为绿色    Log.i(tag,msg);
4.warn    输出颜色为橘黄色  Log.w(tag,msg);
5.error   输出颜色为红色    Log.e(tag,msg);

*/
// 不确定mongo该怎么用
export async function logActivityVerbose(action: string, tenantId: string, unique_name: string, details: any) {
    // Verbose logging to console
    if (typeof details === 'string') {
        details = { "message": details };
    }
    return new Promise(function (resolve, reject) {
        console.log(`action: ${action}  tenantId: ${tenantId}  unique_name: ${unique_name} details: ${JSON.stringify(details)}`);
        if (Config.logVerboseEnabledForTenant.find((x) => x == tenantId)) {
            logActivity(action, tenantId, unique_name, details);
        }
        resolve();
    });
}

//记录日志活动。 action操作类型， tenantId租户的id， unique_name:唯一的名称 details：详细内容
export async function logActivity(action: string, tenantId: string, unique_name: string, details: any) {
    if (typeof details === 'string') {
        details = { "message": details };
    }
    return new Promise(function (resolve, reject) {
        // log everything to console
        console.log(`action: ${action}  tenantId: ${tenantId}  unique_name: ${unique_name} details: ${JSON.stringify(details)}`);
        console.log("eeeewwwwww");
        // if developer mode, we are done
        if (developer_mode && !logInDeveloperMode) {
            console.log(33333333);
            resolve();
        }
        // log diagnostic info to Azure  诊断日志存在Azure
        let dt = new Date();

        let newActivity = {
            "PartitionKey": (dt.toISOString().substring(0, 10)).toString(),
            "RowKey": (uuid.v4().toString()).toString(),
            "action": (action).toString(),
            "tenantId": (tenantId).toString(),
            "unique_name": (unique_name).toString(),
            "details": (JSON.stringify(details)).toString()
        };
        MongoClient.connect(DBurl, options, (error, client) => {//连接数据库
            if (error) {//失败
                console.log(error);
                return;
            }
            console.log("连接数据库成功")
            let db = client.db(tableService);   /*获取db对象--表名*/
            db.collection(activityTableName).insertOne(newActivity, (err) => {
                if (err) {
                    console.log(err);
                    return false;
                } else {
                    resolve();
                }
                client.close();  /*关闭数据库*/
            });
        });
        // let startTime = Date.now();
        // tableService.insertEntity(activityTableName, newActivity, function (error, result, response) {
        //     let duration = Date.now() - startTime;
        //     MEEServices.trackDependency("azure-storage/meetelemetry", "insertEntity", duration, true);
        //     try {
        //         if (error) {
        //             throw error;
        //         }
        //         else {
        //             resolve();
        //         }
        //     }
        //     catch (err) {
        //         err['entity'] = newActivity;
        //         reject(err);
        //     }
        // });
    });
}