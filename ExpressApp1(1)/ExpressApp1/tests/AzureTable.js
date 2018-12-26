"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const azure_storage_1 = require("azure-storage");
const entityConverter_1 = require("./core/entityConverter");
class AzureTableService {
}
exports.AzureTableService = AzureTableService;
function defaultEntityResolver(en) {
    const r = {};
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
class AzureTable {
    constructor(setting) {
        this.checkedTables = {};
        if (!setting.rowKeyName || (setting.rowKeyName.length == 0) || !setting.partitionKeyName || (setting.rowKeyName.length == 0)) {
            throw new Error('PartitionKeyName & RowKeyName must be defined');
        }
        this.setting = setting;
        // Connection string takes precedence
        if (setting.connectionString) {
            this.service = azure_storage_1.createTableService(setting.connectionString);
        }
        else {
            this.service = azure_storage_1.createTableService(this.setting.accountName, this.setting.accessKey);
        }
        if (this.setting.retryPolicy) {
            this.service.withFilter(this.setting.retryPolicy);
        }
        this.entityResolver = this.setting.entityResolver || defaultEntityResolver;
        let denodeify = entityConverter_1.EntityConverter.denodeify;
        this.service.createTableIfNotExistsAsync = denodeify(this.service, this.service.createTableIfNotExists);
        this.service.deleteTableIfExistsAsync = denodeify(this.service, this.service.deleteTableIfExists);
        this.service.retrieveEntityAsync = denodeify(this.service, this.service.retrieveEntity);
        this.service.insertOrReplaceEntityAsync = denodeify(this.service, this.service.insertOrReplaceEntity);
        this.service.replaceEntityAsync = denodeify(this.service, this.service.replaceEntity);
        this.service.deleteEntityAsync = denodeify(this.service, this.service.deleteEntity);
        this.service.executeBatchAsync = denodeify(this.service, this.service.executeBatch);
        this.service.insertOrMergeAsync = denodeify(this.service, this.service.insertOrMergeEntity);
    }
    ensureTable() {
        let tableName = this.setting.tableName;
        if (!this.checkedTables[tableName]) {
            this.checkedTables[tableName] = this.service.createTableIfNotExistsAsync(tableName);
        }
        return this.checkedTables[tableName];
    }
    getRowKey(rowKey, model) {
        return Object.is(rowKey, undefined) ? model[this.setting.rowKeyName] : rowKey;
    }
    retrieve(model, rowKey = undefined) {
        let retrievedEntity = {};
        return this.ensureTable()
            .then((created) => {
            let options = {};
            options.entityResolver = this.entityResolver;
            return this.service.retrieveEntityAsync(this.setting.tableName, model[this.setting.partitionKeyName], rowKey || model[this.setting.rowKeyName], options)
                .then((result) => {
                retrievedEntity.entity = result;
                retrievedEntity.exists = true;
            }, (error) => {
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
    insertOrMerge(model, rowKey = undefined) {
        return this.ensureTable()
            .then((created) => {
            const entity = entityConverter_1.EntityConverter.convertToEntity(model[this.setting.partitionKeyName], this.getRowKey(rowKey, model), model, true);
            return this.service.insertOrMergeAsync(this.setting.tableName, entity);
        }).then(result => { }, (error) => {
            throw error;
        });
    }
    /**
     * Trys to insert or replace an entity into the table. Values that are undefined will be reflected in the row.
     * Note: All number values will be set to Int32
     * @param model The entity that will be inserted.
     * @param rowKey Optional rowKey value that will override the default.
     */
    insertOrReplace(model, rowKey = undefined) {
        return this.ensureTable()
            .then((created) => {
            const entity = entityConverter_1.EntityConverter.convertToEntity(model[this.setting.partitionKeyName], this.getRowKey(rowKey, model), model, false);
            return this.service.insertOrReplaceEntityAsync(this.setting.tableName, entity);
        }).then(result => { }, (error) => {
            throw error;
        });
    }
    delete(model, rowKey = undefined) {
        return this.ensureTable()
            .then((created) => {
            const entity = entityConverter_1.EntityConverter.convertToEntity(model[this.setting.partitionKeyName], this.getRowKey(rowKey, model), {}, true);
            return this.service.deleteEntityAsync(this.setting.tableName, entity);
        })
            .then(result => { }, (error) => {
            throw error;
        });
    }
    deleteTable() {
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
    batchInsertEntity(models, ignoreUndefined = false) {
        let tableBatch = new azure_storage_1.TableBatch();
        return this.ensureTable()
            .then((created) => {
            models.forEach((model) => {
                const entity = entityConverter_1.EntityConverter.convertToEntity(model[this.setting.partitionKeyName], model[this.setting.rowKeyName], model, ignoreUndefined);
                tableBatch.insertOrReplaceEntity(entity);
            });
            return this.service.executeBatchAsync(this.setting.tableName, tableBatch);
        });
    }
    queryTillEnd(query, currentToken, array, resolve, reject) {
        this.service.queryEntities(this.setting.tableName, query, currentToken, (error, result, response) => {
            if (error) {
                reject(error);
            }
            else {
                const entities = result.entries.map(m => entityConverter_1.EntityConverter.map(m));
                if (result.continuationToken) {
                    this.queryTillEnd(query, result.continuationToken, array.concat(entities), resolve, reject);
                }
                else {
                    resolve(array.concat(entities));
                }
            }
        });
    }
    query(tableQuery, currentToken, callback) {
        return this.service.queryEntities(this.setting.tableName, tableQuery, currentToken, callback);
    }
    queryEntities(query) {
        return new Promise((resolve, reject) => {
            this.queryTillEnd(query, null, [], resolve, reject);
        });
    }
}
exports.AzureTable = AzureTable;
//# sourceMappingURL=AzureTable.js.map