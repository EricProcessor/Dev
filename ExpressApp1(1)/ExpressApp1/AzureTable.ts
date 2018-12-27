import {TableQuery, TableService, TableUtilities, createTableService, TableBatch, RetryPolicyFilter, ErrorOrResult} from "azure-storage";
import { EntityConverter } from "./core/entityConverter";

export interface StorageAccountSettings {
    accessKey:string;
    accountName:string;
    connectionString:string;
    retryPolicy: RetryPolicyFilter.IRetryPolicy;
}

export interface TableSetting extends StorageAccountSettings {
    tableName: string;
    partitionKeyName: string;
    rowKeyName: string;
    entityResolver(enitityResult: object): object;
}

export interface RetrievedEntity<T> {
    exists: boolean;
    entity: T;
}

export class AzureTableService<T> {
    settings: T;
    service: TableServiceAsync;
}

/**
* EntityResolver is used by Azure Storage retrival to convert the entity. It should be of type format: (entityResult: Object) => Object
*/
export interface EntityResolver {
    (entityResult: Object): Object;
}

function defaultEntityResolver(en: any) {
    const r = {} as any;
    for (let k in en) {
        r[k] = en[k]._;
    }
    return r;
}

/**
 * Azure wrapper that promisifies azure-storage functions. The table strongly ties itself to a Generic 'model'. 
 * PartitionKey and RowKey are currently set through Table Setting. 
 * 
 * The only drawback of this class is that currently the partitionkey and rowkey are duplicated when creating a row.
 * The design was intentionally kept this way, as tables recommend to use variants to partition keys and rowkeys, to optimize
 * queries. Since cost of writing to tables is low it made sesne to let the partitionkey and rowkey be duplicated.
 * 
 * As of now only rowkey values can be override, I expect partition keys to always be the same.
 */
export class AzureTable<Model> { // Slight template hack as typescript doesn't support multiple inheritances.
    protected service: TableServiceAsync;
    protected readonly setting:TableSetting;
    protected entityResolver;

    protected checkedTables: { [name: string]: Promise<TableService.TableResult>; } = {};

    constructor(setting:TableSetting) {
        if (!setting.rowKeyName || (setting.rowKeyName.length == 0) || !setting.partitionKeyName || (setting.rowKeyName.length == 0)) {
            throw new Error('PartitionKeyName & RowKeyName must be defined');
        }

        this.setting = setting;

        // Connection string takes precedence
        if (setting.connectionString) {
            this.service = <TableServiceAsync>createTableService(setting.connectionString);
        }
        else {
            this.service = <TableServiceAsync>createTableService(this.setting.accountName, this.setting.accessKey);
        }

        if (this.setting.retryPolicy) {
            this.service.withFilter(this.setting.retryPolicy);
        }

        this.entityResolver = this.setting.entityResolver || defaultEntityResolver;

        let denodeify = EntityConverter.denodeify;
        this.service.createTableIfNotExistsAsync = denodeify(this.service, (this.service as TableService).createTableIfNotExists);
        this.service.deleteTableIfExistsAsync = denodeify(this.service, (this.service as TableService).deleteTableIfExists);
        this.service.retrieveEntityAsync = denodeify(this.service, (this.service as TableService).retrieveEntity);
        this.service.insertOrReplaceEntityAsync = denodeify(this.service, (this.service as TableService).insertOrReplaceEntity);
        this.service.replaceEntityAsync = denodeify(this.service, (this.service as TableService).replaceEntity);
        this.service.deleteEntityAsync = denodeify(this.service, (this.service as TableService).deleteEntity);
        this.service.executeBatchAsync = denodeify(this.service, (this.service as TableService).executeBatch);
        this.service.insertOrMergeAsync = denodeify(this.service, (this.service as TableService).insertOrMergeEntity);
    }

    protected ensureTable(): Promise<TableService.TableResult> {
        let tableName = this.setting.tableName;
        if (!this.checkedTables[tableName]) {
            this.checkedTables[tableName] = this.service.createTableIfNotExistsAsync(tableName);
        }

        return this.checkedTables[tableName];
    }

    protected getRowKey(rowKey: string, model: Model) : string{
        return Object.is(rowKey, undefined) ? model[this.setting.rowKeyName] : rowKey;
    }

    public retrieve(model: Model, rowKey: string = undefined) : Promise<RetrievedEntity<Model>> {
        let retrievedEntity : RetrievedEntity<Model> = {} as any;
        return this.ensureTable()
            .then((created) => {
                let options: TableService.TableEntityRequestOptions = {} as any;
                options.entityResolver = this.entityResolver;
                return this.service.retrieveEntityAsync<Model>(this.setting.tableName, model[this.setting.partitionKeyName], rowKey || model[this.setting.rowKeyName], options)
                .then((result) => {                 
                    retrievedEntity.entity = result as Model;
                    retrievedEntity.exists = true;
                },
                (error) => {
                    if (error.statusCode === 404) {
                        retrievedEntity.exists = false;
                        return;
                    }
                    else {
                        console.log("Retrieve User Error:" + error);
                        throw error;
                    }
                });
       }).then(result => retrievedEntity);
    }

    /**
     * Trys to insert or merge an entity into the table. Values that are undefined will not be replaced for existing entities.
     * Note: All number values will be set to Int32
     * @param model The entity that will be inserted.
     */
    public insertOrMerge(model: Model, rowKey: string = undefined) : Promise<void> {
        return this.ensureTable()
            .then((created) => {                
                const entity = EntityConverter.convertToEntity(model[this.setting.partitionKeyName], this.getRowKey(rowKey, model), model, true);
                return this.service.insertOrMergeAsync(this.setting.tableName, entity);
            }).then(result => {},
                (error) => {
                    throw error;
                });        
    }

    /**
     * Trys to insert or replace an entity into the table. Values that are undefined will be reflected in the row.
     * Note: All number values will be set to Int32
     * @param model The entity that will be inserted.
     * @param rowKey Optional rowKey value that will override the default.
     */
    public insertOrReplace(model: Model, rowKey: string = undefined) : Promise<void> {
        return this.ensureTable()
            .then((created) => {                
                const entity = EntityConverter.convertToEntity(model[this.setting.partitionKeyName], this.getRowKey(rowKey, model), model, false);
                return this.service.insertOrReplaceEntityAsync(this.setting.tableName, entity);
            }).then(result => {},
                (error) => {
                    throw error;
                });        
    }

    public delete(model: Model, rowKey: string = undefined) : Promise<void> {
        return this.ensureTable()
            .then((created)  => {
                const entity = EntityConverter.convertToEntity(model[this.setting.partitionKeyName], this.getRowKey(rowKey, model), {}, true);
                return this.service.deleteEntityAsync(this.setting.tableName, entity);
            })
            .then(result => {},
                (error) => {
                    throw error;
                });
    }

    public deleteTable() : Promise<boolean> {
        return this.ensureTable()
        .then((created) => {
            return this.service.deleteTableIfExistsAsync(this.setting.tableName);
        });
    }

    /**
     * BatchInsertEntity Must have the same partition key and limited to 100 entities. During parallellization, make sure to limit
     * the number of concurrent calls tha may occur, overwhelming the azure table may lead to failures. It is recommended to use some
     * form of retry logic.
     * */
    //批量插入
    public batchInsertEntity(models :Model[], ignoreUndefined: boolean = false) : Promise<void> {
        let tableBatch = new TableBatch();
        return this.ensureTable()
                .then((created) => {
                    models.forEach((model) => {
                        const entity = EntityConverter.convertToEntity(model[this.setting.partitionKeyName], model[this.setting.rowKeyName], model, ignoreUndefined);
                        tableBatch.insertOrReplaceEntity(entity);
                    });

                    return this.service.executeBatchAsync(this.setting.tableName, tableBatch);
                });
    }

    private queryTillEnd(query: TableQuery, currentToken: TableService.TableContinuationToken, array: Model[], resolve, reject) {
        this.service.queryEntities(this.setting.tableName, query, currentToken, (error, result, response) => {
            if (error) {
                reject(error);
            } else {
                const entities = result.entries.map(m => EntityConverter.map<Model>(m));
                
                if (result.continuationToken) {
                    this.queryTillEnd(query, result.continuationToken, array.concat(entities), resolve, reject);
                } else {
                    resolve(array.concat(entities));
                }
            }
        });
    }

    public query(tableQuery: TableQuery, currentToken: TableService.TableContinuationToken, callback: ErrorOrResult<TableService.QueryEntitiesResult<Model>>)
    {
        return this.service.queryEntities(this.setting.tableName, tableQuery, currentToken, callback);
    }

    public queryEntities(query: TableQuery) {
        return new Promise<Model[]>((resolve, reject) => {
            this.queryTillEnd(query, null, [], resolve, reject);
        });
    }
}
//定义接口
interface TableServiceAsync extends TableService {
	//检测表是否存在
    createTableIfNotExistsAsync(table: string): Promise<TableService.TableResult>;
    deleteTableIfExistsAsync(table: string): Promise<boolean>;
    retrieveEntityAsync<T>(table: string, partitionKey: string, rowKey: string, options: TableService.TableEntityRequestOptions): Promise<T>;
    replaceEntityAsync<T>(table: string, entityDescriptor: T): Promise<TableService.EntityMetadata>;
    insertOrReplaceEntityAsync<T>(table: string, entityDescriptor: T): Promise<TableService.EntityMetadata>;
    deleteEntityAsync<T>(table: string, entityDescriptor: T): Promise<void>;
    executeBatchAsync<T>(table:string, tableBatch: TableBatch) : Promise<void>;
    insertOrMergeAsync<T>(table:string, entityDescriptor: T) : Promise<void>;
}