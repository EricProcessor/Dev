"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const azure_storage_1 = require("azure-storage");
/*
创建一个entGen实体
官方例子:
    var entGen = azure.TableUtilities.entityGenerator;
    var task = {
    PartitionKey: entGen.String('hometasks'),
    RowKey: entGen.String('1'),
    description: entGen.String('take out the trash'),
    dueDate: entGen.DateTime(new Date(Date.UTC(2015, 6, 20)))
    };
*/
var entGen = azure_storage_1.TableUtilities.entityGenerator;
class EntityConverter {
    static map(entity) {
        var mapped = {};
        Object.keys(entity).forEach((key) => {
            var prop = entity[key];
            mapped[key] = prop ? prop._ : null;
        });
        return mapped;
    }
    // Use this to convert callback into a promise (Taken from botbuilder-azure)
    static denodeify(thisArg, fn) {
        return (...args) => {
            return new Promise((resolve, reject) => {
                args.push((error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                });
                fn.apply(thisArg, args);
            });
        };
    }
    /**
     * Convert a given object into an Azure Entity.
     * @param partitionKey Partition key value
     * @param rowKey Row Key value
     * @param values Can be undefined, in this case only the value for the partiiton key and rowkey are used.
     * @param ignoreUndefined Ignores undefined values. Useful in certain azure merge cases.
     */
    static convertToEntity(partitionKey, rowKey, values, ignoreUndefined) {
        const entity = Object.getOwnPropertyNames(values).reduce((o, k) => {
            let val = EntityConverter.convertToEntityValue(values[k]);
            if (!((val === undefined) && ignoreUndefined)) {
                o[k] = val;
            }
            return o;
        }, {});
        entity.PartitionKey = entGen.String(partitionKey);
        entity.RowKey = entGen.String(rowKey);
        return entity;
    }
    static convertToEntityValue(value) {
        if (typeof value === 'undefined') {
            return undefined;
        }
        else if (value === undefined) {
            return undefined;
        }
        else if (value === null) {
            return undefined;
        }
        else if (typeof value === 'string') {
            return entGen.String(value);
        }
        else if (typeof value === 'boolean') {
            return entGen.Boolean(value);
        }
        else if (typeof value === 'number') {
            if (Math.floor(value) === value) {
                return entGen.Int32(value);
            }
            else {
                return entGen.Double(value);
            }
        }
        else if (value instanceof Date) {
            return entGen.DateTime(value);
        }
        else { // if (typeof value === 'object') {
            return entGen.String(JSON.stringify(value));
        }
    }
}
exports.EntityConverter = EntityConverter;
//# sourceMappingURL=entityConverter.js.map