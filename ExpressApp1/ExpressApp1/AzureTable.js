"use strict";
exports.__esModule = true;
var azure_storage_1 = require("azure-storage");
var entityConverter_1 = require("./core/entityConverter");
var AzureTableService = /** @class */ (function () {
    function AzureTableService() {
    }
    return AzureTableService;
}());
exports.AzureTableService = AzureTableService;
function defaultEntityResolver(en) {
    var r = {};
    for (var k in en) {
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
var AzureTable = /** @class */ (function () {
    function AzureTable(setting) {
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
        var denodeify = entityConverter_1.EntityConverter.denodeify;
        this.service.createTableIfNotExistsAsync = denodeify(this.service, this.service.createTableIfNotExists);
        this.service.deleteTableIfExistsAsync = denodeify(this.service, this.service.deleteTableIfExists);
        this.service.retrieveEntityAsync = denodeify(this.service, this.service.retrieveEntity);
        this.service.insertOrReplaceEntityAsync = denodeify(this.service, this.service.insertOrReplaceEntity);
        this.service.replaceEntityAsync = denodeify(this.service, this.service.replaceEntity);
        this.service.deleteEntityAsync = denodeify(this.service, this.service.deleteEntity);
        this.service.executeBatchAsync = denodeify(this.service, this.service.executeBatch);
        this.service.insertOrMergeAsync = denodeify(this.service, this.service.insertOrMergeEntity);
    }
    AzureTable.prototype.ensureTable = function () {
        var tableName = this.setting.tableName;
        if (!this.checkedTables[tableName]) {
            this.checkedTables[tableName] = this.service.createTableIfNotExistsAsync(tableName);
        }
        return this.checkedTables[tableName];
    };
    AzureTable.prototype.getRowKey = function (rowKey, model) {
        return Object.is(rowKey, undefined) ? model[this.setting.rowKeyName] : rowKey;
    };
    AzureTable.prototype.retrieve = function (model, rowKey) {
        var _this = this;
        if (rowKey === void 0) { rowKey = undefined; }
        var retrievedEntity = {};
        return this.ensureTable()
            .then(function (created) {
            var options = {};
            options.entityResolver = _this.entityResolver;
            return _this.service.retrieveEntityAsync(_this.setting.tableName, model[_this.setting.partitionKeyName], rowKey || model[_this.setting.rowKeyName], options)
                .then(function (result) {
                retrievedEntity.entity = result;
                retrievedEntity.exists = true;
            }, function (error) {
                if (error.statusCode === 404) {
                    retrievedEntity.exists = false;
                    return;
                }
                else {
                    console.log("Retrieve User Error:" + error);
                    throw error;
                }
            });
        }).then(function (result) { return retrievedEntity; });
    };
    /**
     * Trys to insert or merge an entity into the table. Values that are undefined will not be replaced for existing entities.
     * Note: All number values will be set to Int32
     * @param model The entity that will be inserted.
     */
    AzureTable.prototype.insertOrMerge = function (model, rowKey) {
        var _this = this;
        if (rowKey === void 0) { rowKey = undefined; }
        return this.ensureTable()
            .then(function (created) {
            var entity = entityConverter_1.EntityConverter.convertToEntity(model[_this.setting.partitionKeyName], _this.getRowKey(rowKey, model), model, true);
            return _this.service.insertOrMergeAsync(_this.setting.tableName, entity);
        }).then(function (result) { }, function (error) {
            throw error;
        });
    };
    /**
     * Trys to insert or replace an entity into the table. Values that are undefined will be reflected in the row.
     * Note: All number values will be set to Int32
     * @param model The entity that will be inserted.
     * @param rowKey Optional rowKey value that will override the default.
     */
    AzureTable.prototype.insertOrReplace = function (model, rowKey) {
        var _this = this;
        if (rowKey === void 0) { rowKey = undefined; }
        return this.ensureTable()
            .then(function (created) {
            var entity = entityConverter_1.EntityConverter.convertToEntity(model[_this.setting.partitionKeyName], _this.getRowKey(rowKey, model), model, false);
            return _this.service.insertOrReplaceEntityAsync(_this.setting.tableName, entity);
        }).then(function (result) { }, function (error) {
            throw error;
        });
    };
    AzureTable.prototype["delete"] = function (model, rowKey) {
        var _this = this;
        if (rowKey === void 0) { rowKey = undefined; }
        return this.ensureTable()
            .then(function (created) {
            var entity = entityConverter_1.EntityConverter.convertToEntity(model[_this.setting.partitionKeyName], _this.getRowKey(rowKey, model), {}, true);
            return _this.service.deleteEntityAsync(_this.setting.tableName, entity);
        })
            .then(function (result) { }, function (error) {
            throw error;
        });
    };
    AzureTable.prototype.deleteTable = function () {
        var _this = this;
        return this.ensureTable()
            .then(function (created) {
            return _this.service.deleteTableIfExistsAsync(_this.setting.tableName);
        });
    };
    /**
     * BatchInsertEntity Must have the same partition key and limited to 100 entities. During parallellization, make sure to limit
     * the number of concurrent calls tha may occur, overwhelming the azure table may lead to failures. It is recommended to use some
     * form of retry logic.
     * */
    AzureTable.prototype.batchInsertEntity = function (models, ignoreUndefined) {
        var _this = this;
        if (ignoreUndefined === void 0) { ignoreUndefined = false; }
        var tableBatch = new azure_storage_1.TableBatch();
        return this.ensureTable()
            .then(function (created) {
            models.forEach(function (model) {
                var entity = entityConverter_1.EntityConverter.convertToEntity(model[_this.setting.partitionKeyName], model[_this.setting.rowKeyName], model, ignoreUndefined);
                tableBatch.insertOrReplaceEntity(entity);
            });
            return _this.service.executeBatchAsync(_this.setting.tableName, tableBatch);
        });
    };
    AzureTable.prototype.queryTillEnd = function (query, currentToken, array, resolve, reject) {
        var _this = this;
        this.service.queryEntities(this.setting.tableName, query, currentToken, function (error, result, response) {
            if (error) {
                reject(error);
            }
            else {
                var entities = result.entries.map(function (m) { return entityConverter_1.EntityConverter.map(m); });
                if (result.continuationToken) {
                    _this.queryTillEnd(query, result.continuationToken, array.concat(entities), resolve, reject);
                }
                else {
                    resolve(array.concat(entities));
                }
            }
        });
    };
    AzureTable.prototype.query = function (tableQuery, currentToken, callback) {
        return this.service.queryEntities(this.setting.tableName, tableQuery, currentToken, callback);
    };
    AzureTable.prototype.queryEntities = function (query) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.queryTillEnd(query, null, [], resolve, reject);
        });
    };
    return AzureTable;
}());
exports.AzureTable = AzureTable;
