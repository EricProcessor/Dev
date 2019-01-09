import {AzureTable, TableSetting, RetrievedEntity }from "../AzureTable"
import {User, UserTable} from "../MeeUserTable"
// import {TableQuery, TableService} from 'azure-storage'
import {Guid} from '../core/guid'
import {Config} from "../Config"
import { EntityConverter } from "../core/entityConverter";
import { StorageConfig } from "../StorageConfig";
import { EnvironmentType } from "../core/environment";

function groupBy<T>( array :T[] ,condition, modifier, selector)
{
    var groups = {};
    array.forEach( function( o )
    {
        if (condition(o)) {
            var group = JSON.stringify( selector(o) );
            groups[group] = groups[group] || [];
            o = modifier(o);
            groups[group].push(o);  
        }
    });

    return Object.keys(groups).map( function( group )
    {
        return groups[group]; 
    })
}

function splitBy(size:number, list : any[]) {
    return list.reduce((acc, curr, index, arr) => {
        if (!(index % size)) {
            return [...acc, arr.slice(index, index + size)];
        }

        return acc;
    }, []);
}

export class UserCopy {
    private originalTable: UserTable;
    private newTable: UserTable;
    
    private processedCount: number = 0;
    private writtenCount: number = 0;

    constructor(orginalTableSetting: TableSetting, newTableSetting: TableSetting, readFromNewTable: boolean = false) {
        this.originalTable = new UserTable(orginalTableSetting);
        this.newTable = new UserTable(newTableSetting);
    }
    
    private async createBatchFromEntities(list) {
        // Process all entities from original table and map them to a User class
        const entities : User[] = list.entries.map(m => EntityConverter.map<User>(m));
        this.processedCount += entities.length;
        // Make sure we have entities
        if (entities.length > 0){
            // Group all entities. We can use the missing anonimizedOid as a tool to catch all entites.
            // The other options were to just query the other table or just merge.
            let group = groupBy<User>(
                entities,
                (cond: User) => !cond.anonimizedOid && cond.oid, 
                (mod: User) => {
                    mod.anonimizedOid = Guid.newGuid();
                    return mod;
                },
                (selector) => selector.tenantId);
          
            let asyncFuncs = [];
            console.log('Read:' + this.processedCount);

            group.forEach((tenant : User[]) => {
                let sessionID = Guid.newGuid();
                let split : User[][]= splitBy(100, tenant);
                split.forEach(val => {

                    // There are chances that the oid is duplicated. This happens when unique_names are used as the rowkey.
                    val = val.filter((value, index, array) => 
                            !array.filter((v, i) => v.oid == value.oid && (i < index)).length);

                    this.writtenCount += val.length;
                     console.log(' Write:' + this.writtenCount);

                    asyncFuncs.push(() => this.newTable.batchInsertEntity(val).then(r => r, (reason) => {
                        console.log('Batching issue with copy: ' + reason);
                        val.forEach(out => console.log('TID:' + out.tenantId + '  OID:' + out.oid + 'unique_name:' + out.unique_name));
                        throw reason;
                    }));
                });
            });

            // Create a promise chain that will run synchronously. We don't want to cause a large impact to the table.
            return asyncFuncs.reduce((prev, curr) => {
                    return prev.then(curr, (reason) => { 
                        console.log('Batching issue with copy: ' + reason);
                        throw reason;
                    });
                }, Promise.resolve());
        }
    }


    public copy() {
        let query = new TableQuery();
        return new Promise<void>((resolve, reject) => this.copyTillEnd(query, null, resolve, reject));
    }

    private async handleQuery(error, result, response, query, resolve, reject) {
        if (error) {
            reject(error)
        }
        else {
            // Process all entities from original table and map them to a User class
            await this.createBatchFromEntities(result);
            if (result.continuationToken) {
                this.copyTillEnd(query, result.continuationToken, resolve, reject);
            } else {
                resolve();
            }    
        }
    }

    public async copyTillEnd(query, currentToken, resolve, reject) {
        // Query will return 1000 entities at a time
        this.originalTable.query(query, currentToken, (error, result, response) =>  this.handleQuery(error, result, response, query, resolve, reject));
    }
}

if (process.argv.length === 3) {
    let targetEnv = process.argv[2].toLowerCase();

    if (targetEnv.match('development')) {
        Config.environmentOverride = EnvironmentType.Development;
        let origTableSetting = StorageConfig.getUserTableSettings();   
        let newTableSetting = StorageConfig.getNewUserTableSettings();
        console.log('Starting Development');
        console.log('   orignaltable:' + origTableSetting.tableName + ' ConnectionString:' + origTableSetting.connectionString + ' AccountName:' + origTableSetting.accountName);
        console.log('   newtable:' + newTableSetting.tableName + ' ConnectionString:' + newTableSetting.connectionString + ' AccountName:' + newTableSetting.accountName);
        let copy: UserCopy = new UserCopy(origTableSetting, newTableSetting);
        copy.copy();
    }
    else if (targetEnv.match('staging')) {
        Config.environmentOverride = EnvironmentType.Staging;
        let origTableSetting = StorageConfig.getUserTableSettings();   
        let newTableSetting = StorageConfig.getNewUserTableSettings();
        console.log('Starting staging');
        console.log('   orignaltable:' + origTableSetting.tableName + ' ConnectionString:' + origTableSetting.connectionString + ' AccountName:' + origTableSetting.accountName);
        console.log('   newtable:' + newTableSetting.tableName + ' ConnectionString:' + newTableSetting.connectionString + ' AccountName:' + newTableSetting.accountName);
        let copy: UserCopy = new UserCopy(origTableSetting, newTableSetting);
        copy.copy();
    }
    else if (targetEnv.match('production')) {
        Config.environmentOverride = EnvironmentType.Production;
        let origTableSetting = StorageConfig.getUserTableSettings();   
        let newTableSetting = StorageConfig.getNewUserTableSettings();
        console.log('Starting staging');
        console.log('   orignaltable:' + origTableSetting.tableName + ' ConnectionString:' + origTableSetting.connectionString + ' AccountName:' + origTableSetting.accountName);
        console.log('   newtable:' + newTableSetting.tableName + ' ConnectionString:' + newTableSetting.connectionString + ' AccountName:' + newTableSetting.accountName);
        let copy: UserCopy = new UserCopy(origTableSetting, newTableSetting);
        copy.copy();
    }
}