// const azure = require("azure-storage");
// const entGen = azure.TableUtilities.entityGenerator;
import * as Utilities from "./utilities";
import * as MEEServices from "./MEEServices";
import {Environment} from "./core/environment"
import { Config } from "./Config";

const developer_mode = Environment.isLocalDev();
const logInDeveloperMode: boolean = true;
const uuid = require("uuid");

/* createTableService部分 
    const tableService = azure.createTableService(
        process.env.AZURE_STORAGE_ACCOUNT    || "meeservicesstorage",
        process.env.AZURE_STORAGE_ACCESS_KEY || "uGGiCXyOCwbFrYXQ4ga03X/C0TAQZTC/4vreChUEBtSDdbJI5FEHZAFlQUQJky6itOtZDMrjZ7FHkp6/D1hCZA==");
*/

const activityTableName = Environment.isProduction() ? "diagnosticlogs" : "stagingdiagnosticlogs";

/* 检查创建表名是否存在，再创建 
    tableService.createTableIfNotExists(activityTableName, function(error, result, response) {
        if (error) {
            process.exit(1);
        }
    });
*/

export async function logActivityVerbose(action: string, tenantId: string, unique_name: string, details: any){
    // Verbose logging to console
    if (typeof details === 'string') {
        details = { "message": details};
    }

    return new Promise(function(resolve, reject) {
        console.log('');
        console.log(`action: ${action}  tenantId: ${tenantId}  unique_name: ${unique_name} details: ${JSON.stringify(details)}`);
        if (Config.logVerboseEnabledForTenant.find((x) => x == tenantId)) {
            logActivity(action, tenantId, unique_name, details);
        }
        resolve();
    });
}

export async function logActivityVerbose(action: string, tenantId: string, unique_name: string, details: any) {
    // Verbose logging to console
    if (typeof details === 'string') {
        details = { "message": details};
    }

    return new Promise(function(resolve, reject) {
        console.log('');
        console.log(`action: ${action}  tenantId: ${tenantId}  unique_name: ${unique_name} details: ${JSON.stringify(details)}`);
        if (Config.logVerboseEnabledForTenant.find((x) => x == tenantId)) {
            logActivity(action, tenantId, unique_name, details);
        }
        resolve();
    });
}

export async function logActivity(action: string, tenantId: string, unique_name: string, details: any) {

    if (typeof details === 'string') {
        details = { "message": details};
    }

    return new Promise(function(resolve, reject) {
        // log everything to console
        console.log('');
        console.log(`action: ${action}  tenantId: ${tenantId}  unique_name: ${unique_name} details: ${JSON.stringify(details)}`);

        // if developer mode, we are done
        if (developer_mode && !logInDeveloperMode) {
            resolve();
        }         

        // log diagnostic info to Azure
        let dt = new Date();
        //插入实体的变量
        // let newActivity = {
        //     "PartitionKey": entGen.String(dt.toISOString().substring(0, 10)),
        //     "RowKey": entGen.String(uuid.v4().toString()),
        //     "action": entGen.String(action),
        //     "tenantId": entGen.String(tenantId),
        //     "unique_name": entGen.String(unique_name),
        //     "details": entGen.String(JSON.stringify(details))
        // };

        let startTime = Date.now();
        /*
        tableService.insertEntity(activityTableName, newActivity, function (error, result, response) {
            let duration = Date.now() - startTime;
            MEEServices.trackDependency("azure-storage/meetelemetry", "insertEntity", duration, true);
        
            try {
                if (error) {
                    throw error;
                }
                else {
                    resolve();
                }
            }
            catch (err) {
                err['entity'] = newActivity;
                reject(err);
            }
        });*/
    });
}