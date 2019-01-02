"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const azure_storage_1 = require("azure-storage");
const entityConverter_1 = require("./core/entityConverter");
//定义TableService接口泛型
class AzureTableService {
}
exports.AzureTableService = AzureTableService;
//带约束的Azure存储转换实体方法
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
/**
*Azure包装器，承诺Azure存储功能。该表与泛型“模型”紧密关联。
*PartitionKey和RowKey当前通过表设置。
*该类的唯一缺点是当前创建行时复制分区键和行键。
*设计是故意这样保留的，因为表建议使用变体来分区键和行键，以便优化
*查询。由于写入表的成本较低，因此允许复制分区键和行键。
*到目前为止，只能重写行键值，我希望分区键总是相同的。
*/
class AzureTable {
    constructor(setting) {
        this.checkedTables = {};
        if (!setting.rowKeyName || (setting.rowKeyName.length == 0) || !setting.partitionKeyName || (setting.rowKeyName.length == 0)) {
            throw new Error('PartitionKeyName & RowKeyName must be defined');
        }
        this.setting = setting;
        // Connection string takes precedence
        //连接字符串优先
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
    //校验操作
    ensureTable() {
        let tableName = this.setting.tableName;
        if (!this.checkedTables[tableName]) {
            this.checkedTables[tableName] = this.service.createTableIfNotExistsAsync(tableName);
        }
        return this.checkedTables[tableName];
    }
    //获取行key值
    getRowKey(rowKey, model) {
        return Object.is(rowKey, undefined) ? model[this.setting.rowKeyName] : rowKey;
    }
    //检索实体
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
    /**
    *尝试将实体插入或合并到表中。未定义的值将不会被现有实体替换。
    *注意：所有数字值都将设置为Int32
    *@param模型将被插入的实体。
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
    /**
    *尝试将实体插入或替换到表中。未定义的值将反映在行中。
    *注意：所有数字值都将设置为Int32
    *@param模型将被插入的实体。
    *@param rowKey可选rowKey值，该值将覆盖默认值。
    */
    //插入或替换方法
    insertOrReplace(model, rowKey = undefined) {
        return this.ensureTable()
            .then((created) => {
            //调用的转换实体方法
            const entity = entityConverter_1.EntityConverter.convertToEntity(model[this.setting.partitionKeyName], this.getRowKey(rowKey, model), model, false);
            //插入或替换操作
            return this.service.insertOrReplaceEntityAsync(this.setting.tableName, entity);
        }).then(result => { }, (error) => {
            throw error;
        });
    }
    //删除方法
    delete(model, rowKey = undefined) {
        return this.ensureTable()
            .then((created) => {
            const entity = entityConverter_1.EntityConverter.convertToEntity(model[this.setting.partitionKeyName], this.getRowKey(rowKey, model), {}, true);
            // 删除实体操作
            return this.service.deleteEntityAsync(this.setting.tableName, entity);
        })
            .then(result => { }, (error) => {
            throw error;
        });
    }
    deleteTable() {
        return this.ensureTable()
            .then((created) => {
            //删除操作  表如果存在执行删除
            return this.service.deleteTableIfExistsAsync(this.setting.tableName);
        });
    }
    /**
     * BatchInsertEntity Must have the same partition key and limited to 100 entities. During parallellization, make sure to limit
     * the number of concurrent calls tha may occur, overwhelming the azure table may lead to failures. It is recommended to use some
     * form of retry logic.
     * */
    /**
    *BatchInsertEntity必须具有相同的分区键，并且限制为100个实体。在并行化期间，请确保限制
    *可能发生的并发调用数量，压倒azure表可能导致失败。建议使用一些
    *重试逻辑的形式。
    **/
    //批量插入
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
        //查询操作
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
    //查询操作---db.user.find() 整个表数据
    query(tableQuery, currentToken, callback) {
        return this.service.queryEntities(this.setting.tableName, tableQuery, currentToken, callback);
    }
    //查询实体 类似于 db.user.find({}) 单个数据
    queryEntities(query) {
        return new Promise((resolve, reject) => {
            this.queryTillEnd(query, null, [], resolve, reject);
        });
    }
}
exports.AzureTable = AzureTable;
//# sourceMappingURL=AzureTable.js.map