import {AzureTable, TableSetting, RetrievedEntity }from "../AzureTable"
import {User, UserTable} from "../MeeUserTable"
// import {TableQuery, TableService} from 'azure-storage'
// import * as az from 'azure-storage'
import {Guid} from '../core/guid'
import {Config} from "../Config"
import { EntityConverter } from "../core/entityConverter";
import { StorageConfig } from "../StorageConfig";
import { EnvironmentType } from "../core/environment";
import { SignInTelemetry, SignInTelemetryTable } from "../MeeSignInTable";
import { UserID } from "../AAD";
import { RandomGenerator } from "./RandomGenerator";

function groupBy<T>( array :T[] , condition : (T) => boolean, modifier : (T) => T, selector: (T) => any)
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


var anonIdCache : {[key: string]: string} = {} as any;

/**
 * 
 * @param telm 
 * @param anonid 
 */
function convertOldSigninToNew(telm: OldSignInTelemetry, anonid:string) : SignInTelemetry {
    let value :SignInTelemetry = {} as any;

    value.Date = telm.Date;
    value.RandomId = telm.RandomId;
    value.AnonomizedUserId = anonid;
    value.TenantId = telm.OMSTentantId;
    value.Application = telm.ClientType;
    value.OSPlatform = telm.OSPlatform;
    value.OSVersion = telm.OSVersion;
    value.IsLicensed = telm.IsLicensed;
    value.LicenseType = telm.LicenseType;
    value.Role = telm.Role;
    value.IsNewUser = telm.IsNewUser;
    value.IsWhiteListed = telm.IsWhiteListed;
    value.Skin = telm.Skin;
    value.RemainingTrials = telm.RemainingTrials;
    return value;    
}

let hits = 0;
let misses = 0;
let sizeOfCache: number = 0;

let timeSpentMakingCalls = 0;

/**
 * Groups by Date, and creates SignInTelemetry
 * @param array 
 * @param table 
 */
async function CustomGroupBy( array :OldSignInTelemetry[], table: UserTable)
{
    var groups = {};
    for(let i =0; i < array.length; i++) 
    {
        let o = array[i];
        if (!!o.OMSUserId && !!o.OMSTentantId) {
            var groupKey = JSON.stringify(o.Date);
            groups[groupKey] = groups[groupKey] || [];

            // Try to get anon id
            let anonId = anonIdCache[o.OMSUserId];
            
            if(!anonId) {
                misses++;
                // Looks like we have not seen it before. Look up the UserTable
                let userId: UserID = {} as any;
                {
                    userId.tenantId = o.OMSTentantId;
                    userId.oid = o.OMSUserId;
                }

                let t0 = process.hrtime();
                let entity = await table.get(userId).then((result) => {
                    timeSpentMakingCalls += duration(t0);
                    return result;
                });

                if (entity.exists && !!entity.entity.anonimizedOid) {
                    sizeOfCache++;
                    anonIdCache[o.OMSUserId] = entity.entity.anonimizedOid;
                    anonId = entity.entity.anonimizedOid
                }
            }
            else{
                hits++;
            }

            if (anonId) {
                // We found our id lets create the new signin table
                let conv = convertOldSigninToNew(o, anonId)
                groups[groupKey].push(conv);
            }
        }
    }

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

interface OldSignInTelemetry {
    Date: string;
    RandomId: string;
    ClientType: string;
    ClientVersion: string;
    IsLicensed: boolean;
    IsNewUser: boolean;
    IsWhiteListed: boolean;
    OMSTentantId: string;
    OMSUserId: string;
    OSPlatform: string;
    OSVersion: string;
    RemainingTrials: number;
    Role: string;
    Skin: string;
    LicenseType: string;
}

interface IEntityProperty<T> {
    _: T;
}

let Gen = new RandomGenerator();

function duration(start) {
    var end = process.hrtime(start);
    return Math.round((end[0]*1000) + (end[1]/1000000));
}

export class SignInTelemetryCopy {
    private originalTable: AzureTable<OldSignInTelemetry>;
    private newTable: SignInTelemetryTable;
    private userTable: UserTable;
    
    public processedCount: number = 0;
    public writtenCount: number = 0;

    public timesCalledCustomGroupBy: number = 0;
    public timeSpentCustomGroupBy: number = 0;

    public timeCalledCreateBatchFromEntities: number = 0;
    public timeSpentCreateBatchFromEntities: number = 0;

    constructor(orginalTableSetting: TableSetting, newTableSetting: TableSetting, userTable: UserTable) {
        this.originalTable = new AzureTable<OldSignInTelemetry>(orginalTableSetting);
        this.newTable = new SignInTelemetryTable(newTableSetting);
        this.userTable = userTable;
    }

    public cmap(entity): OldSignInTelemetry {
        var mapped = {} as OldSignInTelemetry;
        Object.keys(entity).forEach((key) => {
            var prop: IEntityProperty<any> = entity[key];
            if (key == 'PartitionKey') {
                mapped.Date = prop._;
            }
            else if (key == 'RowKey') {
                mapped.RandomId = prop._;
            }
            else {
                mapped[key] = prop ? prop._ : null;
            }
        });

        return mapped;
    }    
    
    private async createBatchFromEntities(origTableList) {
        // Process all entities from original table and map them to a User class
        const entities : OldSignInTelemetry[] = origTableList.entries.map(m => this.cmap(m));
        this.processedCount += entities.length;

        // Make sure we have entities to process
        if (entities.length > 0){
            this.timesCalledCustomGroupBy++;
            let t0 = process.hrtime();
            let convertedEntities :any = await CustomGroupBy(entities, this.userTable);
            this.timeSpentCustomGroupBy += duration(t0);

            if (Gen.Integer(0, 100) > 80) {
                this.displayStats();
            }

            let asyncFuncs = [];

            convertedEntities.forEach((telm : SignInTelemetry[]) => {
                let split : SignInTelemetry[][]= splitBy(100, telm);
                split.forEach(val => {

                    // There are chances that the oid is duplicated. This happens when unique_names are used as the rowkey.
                    val = val.filter((value, index, array) => 
                            !array.filter((v, i) => v.RandomId == value.RandomId && (i < index)).length);

                    this.writtenCount += val.length;

                    asyncFuncs.push(() => this.newTable.batchInsertEntity(val).then(r => r, (reason) => {
                        console.log('Batching issue with copy: ' + reason);
                        val.forEach(out => console.log('PKEY:' + out.Date + '  RKEY:' + out.RandomId + 'Tenant:' + out.TenantId));
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

    public displayStats() {
        console.log('Read:' + this.processedCount);
        console.log(' Write:' + this.writtenCount + ' Hits/Misses: ' + hits + '//' + misses + ' SizeOfCache: ' + sizeOfCache);
        console.log(' TimeSpent:')
        console.log('   Making gets:' + timeSpentMakingCalls + ' ms (Misses: ' + misses + ' Average: '+ timeSpentMakingCalls / misses);
        console.log('   CustomGroupBy:' + this.timeSpentCustomGroupBy + ' ms (Calls: ' + this.timesCalledCustomGroupBy + ' Average: '+ this.timeSpentCustomGroupBy / this.timesCalledCustomGroupBy);
        console.log('   CreateBatch:' + this.timeSpentCreateBatchFromEntities + ' ms (Calls: ' + this.timeCalledCreateBatchFromEntities + ' Average: '+ this.timeSpentCreateBatchFromEntities / this.timeCalledCreateBatchFromEntities);
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
            let t0 = process.hrtime();
            // Process all entities from original table and map them to a User class
            await this.createBatchFromEntities(result);
            this.timeSpentCreateBatchFromEntities = duration(t0);
            this.timeCalledCreateBatchFromEntities++;

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

function entityResolver(en: any) {
    const r = {} as any;
    for (let k in en) {
        if (k == 'PartitionKey') {
            r['Date'] = en[k]._;
        }
        else if (k == 'RowKey') {
            r['RandomId'] = en[k]._;
        }
        else {
            r[k] = en[k]._;
        }
    }
    return r;
}

if (process.argv.length === 3) {
    let targetEnv = process.argv[2].toLowerCase();
    let userTableSetting = StorageConfig.getNewUserTableSettings();
    let origTableSetting = StorageConfig.getTelemetryTableSettings();
    origTableSetting.entityResolver = entityResolver;

    let newTableSetting = StorageConfig.getTelemetryTableSettings();

    userTableSetting.retryPolicy = new az.LinearRetryPolicyFilter(5, 500);
    origTableSetting.retryPolicy = new az.LinearRetryPolicyFilter(5, 500);
    newTableSetting.retryPolicy = new az.LinearRetryPolicyFilter(5, 500);

    if (targetEnv.match('development')) {
        Config.environmentOverride = EnvironmentType.Development;
        userTableSetting.tableName = "users";
        userTableSetting.connectionString = undefined;
        userTableSetting.accountName = StorageConfig.defaultAccountName;
        userTableSetting.accessKey = StorageConfig.defaultAccessKey;

        origTableSetting.tableName = "signintelemetry";
        origTableSetting.connectionString = undefined;
        origTableSetting.accountName = StorageConfig.devAccountName;
        origTableSetting.accessKey = StorageConfig.devAccessKey;

        newTableSetting.tableName = "developmenttelemetry";
        newTableSetting.connectionString = undefined;
        newTableSetting.accountName = StorageConfig.devAccountName;
        newTableSetting.accessKey = StorageConfig.devAccessKey;

        console.log('Starting Development');
        console.log('   orignaltable:' + origTableSetting.tableName + ' ConnectionString:' + origTableSetting.connectionString + ' AccountName:' + origTableSetting.accountName);
        console.log('   newtable:' + newTableSetting.tableName + ' ConnectionString:' + newTableSetting.connectionString + ' AccountName:' + newTableSetting.accountName);
        console.log('   usertable:' + userTableSetting.tableName + ' ConnectionString:' + userTableSetting.connectionString + ' AccountName:' + userTableSetting.accountName);
        let copy: SignInTelemetryCopy = new SignInTelemetryCopy(origTableSetting, newTableSetting, new UserTable(userTableSetting));
        let startTime = process.hrtime();
        copy.copy().then(() => {
            copy.displayStats();
            console.log('Duration: ' + duration(startTime) + 'ms')
        });
    }
    /*
    else if (targetEnv.match('staging')) {
        Config.environmentOverride = EnvironmentType.Staging;
        console.log('Starting staging');
        console.log('   orignaltable:' + origTableSetting.tableName + ' ConnectionString:' + origTableSetting.connectionString + ' AccountName:' + origTableSetting.accountName);
        console.log('   newtable:' + newTableSetting.tableName + ' ConnectionString:' + newTableSetting.connectionString + ' AccountName:' + newTableSetting.accountName);
        console.log('   usertable:' + userTableSetting.tableName + ' ConnectionString:' + userTableSetting.connectionString + ' AccountName:' + userTableSetting.accountName);
        let copy: SignInTelemetryCopy = new SignInTelemetryCopy(origTableSetting, newTableSetting, new UserTable(userTableSetting));
        copy.copy();
    }*/
}