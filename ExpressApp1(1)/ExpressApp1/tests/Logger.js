"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const azure = require("azure-storage");
const MEEServices = require("./MEEServices");
const entGen = azure.TableUtilities.entityGenerator;
const environment_1 = require("./core/environment");
const Config_1 = require("./Config");
const developer_mode = environment_1.Environment.isLocalDev();
const logInDeveloperMode = true;
const uuid = require("uuid");
const tableService = azure.createTableService(process.env.AZURE_STORAGE_ACCOUNT || "meeservicesstorage", process.env.AZURE_STORAGE_ACCESS_KEY || "uGGiCXyOCwbFrYXQ4ga03X/C0TAQZTC/4vreChUEBtSDdbJI5FEHZAFlQUQJky6itOtZDMrjZ7FHkp6/D1hCZA==");
const activityTableName = environment_1.Environment.isProduction() ? "diagnosticlogs" : "stagingdiagnosticlogs";
tableService.createTableIfNotExists(activityTableName, function (error, result, response) {
    if (error) {
        process.exit(1);
    }
});
function logActivityVerbose(action, tenantId, unique_name, details) {
    return __awaiter(this, void 0, void 0, function* () {
        // Verbose logging to console
        if (typeof details === 'string') {
            details = { "message": details };
        }
        return new Promise(function (resolve, reject) {
            console.log('');
            console.log(`action: ${action}  tenantId: ${tenantId}  unique_name: ${unique_name} details: ${JSON.stringify(details)}`);
            if (Config_1.Config.logVerboseEnabledForTenant.find((x) => x == tenantId)) {
                logActivity(action, tenantId, unique_name, details);
            }
            resolve();
        });
    });
}
exports.logActivityVerbose = logActivityVerbose;
function logActivity(action, tenantId, unique_name, details) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof details === 'string') {
            details = { "message": details };
        }
        return new Promise(function (resolve, reject) {
            // log everything to console
            console.log('');
            console.log(`action: ${action}  tenantId: ${tenantId}  unique_name: ${unique_name} details: ${JSON.stringify(details)}`);
            // if developer mode, we are done
            if (developer_mode && !logInDeveloperMode) {
                resolve();
            }
            // log diagnostic info to Azure
            let dt = new Date();
            let newActivity = {
                "PartitionKey": entGen.String(dt.toISOString().substring(0, 10)),
                "RowKey": entGen.String(uuid.v4().toString()),
                "action": entGen.String(action),
                "tenantId": entGen.String(tenantId),
                "unique_name": entGen.String(unique_name),
                "details": entGen.String(JSON.stringify(details))
            };
            let startTime = Date.now();
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
            });
        });
    });
}
exports.logActivity = logActivity;
//# sourceMappingURL=Logger.js.map