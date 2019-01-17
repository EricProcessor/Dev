// import {AzureTable, TableSetting, RetrievedEntity }from "../AzureTable"
import {User, UserTable} from "../MeeUserTable"
// import {TableQuery, TableService} from 'azure-storage'
import {Guid} from '../core/guid'
import {Config} from "../Config"
import { EntityConverter } from "../core/entityConverter";
import { StorageConfig } from "../StorageConfig";
import { EnvironmentType } from "../core/environment";
import { RandomGenerator } from "./RandomGenerator";

if (process.argv.length === 3) {
    let targetEnv = process.argv[2].toLowerCase();

    if (targetEnv.match('development')) {
        Config.environmentOverride = EnvironmentType.Development;
    }
    else if (targetEnv.match('staging')) {
        Config.environmentOverride = EnvironmentType.Staging;
    }
    else if (targetEnv.match('production')) {
        Config.environmentOverride = EnvironmentType.Production;
    }
    else {
        console.log('No target environment chosen. Quitting.')
        process.exit();
    }
}
else {
    console.log('No target environment chosen. Quitting.')
    process.exit();
}

let origTableSetting = StorageConfig.getUserTableSettings();   
console.log('Environemnt:' + Config.environmentOverride);
console.log('   Table Settings:' + origTableSetting.tableName);
console.log('   Connection Settings:' + origTableSetting.connectionString);
console.log('   AccountName:' + origTableSetting.accountName);

let table = new UserTable(origTableSetting);
let currentQueryCount = 0;
let totalCount = 0;
let Gen = new RandomGenerator();

async function query() {
    let query = new TableQuery();
    return new Promise<void>((resolve, reject) => queryTillEnd(query, null, resolve, reject));
}

async function handleQuery(error, result, response, query, resolve, reject) {
    if (error) {
        reject(error)
    }
    else {

        if (Gen.Integer(0, 100) > 80) {
            console.log('Total Users:' + totalCount + ' Current Query:' + currentQueryCount);
        }
        
        const entities : User[] = result.entries.map(m => EntityConverter.map<User>(m));
        totalCount += entities.length;
        entities.forEach((user) => {
            if (!user.oid) {
                currentQueryCount++;
            }        

        });
        if (result.continuationToken) {
            queryTillEnd(query, result.continuationToken, resolve, reject);
        } else {
            resolve();
        }    
    }
}

async function queryTillEnd(query: TableQuery, currentToken: TableService.TableContinuationToken, resolve, reject) {
    // Query will return 1000 entities at a time
    table.query(query, currentToken, (error, result, response) =>  handleQuery(error, result, response, query, resolve, reject));
}

query().then(() => console.log('Completed: Total Users:' + totalCount + ' Current Query:' + currentQueryCount));