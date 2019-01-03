"use strict";
//import { TableUtilities } from "azure-storage";
exports.__esModule = true;
var EntityConverter = /** @class */ (function () {
    function EntityConverter() {
    }
    EntityConverter.map = function (entity) {
        var mapped = {};
        Object.keys(entity).forEach(function (key) {
            var prop = entity[key];
            mapped[key] = prop ? prop._ : null;
        });
        return mapped;
    };
    // Use this to convert callback into a promise (Taken from botbuilder-azure)
    EntityConverter.denodeify = function (thisArg, fn) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new Promise(function (resolve, reject) {
                args.push(function (error, result) {
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
    };
    /**
     * Convert a given object into an Azure Entity.
     * @param partitionKey Partition key value
     * @param rowKey Row Key value
     * @param values Can be undefined, in this case only the value for the partiiton key and rowkey are used.
     * @param ignoreUndefined Ignores undefined values. Useful in certain azure merge cases.
     */
    //将给定对象转换为Azure实体。
    EntityConverter.convertToEntity = function (partitionKey, rowKey, values, ignoreUndefined) {
        var entity = Object.getOwnPropertyNames(values).reduce(function (o, k) {
            var val = EntityConverter.convertToEntityValue(values[k]);
            if (!((val === undefined) && ignoreUndefined)) {
                o[k] = val;
            }
            return o;
        }, {});
        // entity.PartitionKey = entGen.String(partitionKey);
        // entity.RowKey = entGen.String(rowKey);
        entity.PartitionKey = String(partitionKey);
        entity.RowKey = String(rowKey);
        return entity;
    };
    //转换到实体
    EntityConverter.convertToEntityValue = function (value) {
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
            //return entGen.String(value);
            return String(value);
        }
        else if (typeof value === 'boolean') {
            //return entGen.Boolean(value);
            return Boolean(value);
        }
        else if (typeof value === 'number') {
            if (Math.floor(value) === value) {
                //return entGen.Int32(value);
                return Number(value);
            }
            else {
                // return entGen.Double(value);
                return value.toFixed(2);
            }
        }
        else if (value instanceof Date) {
            //return entGen.DateTime(value);
            return new Date(value);
        }
        else { // if (typeof value === 'object') {
            // return entGen.String(JSON.stringify(value));
            return JSON.stringify(value);
        }
    };
    return EntityConverter;
}());
exports.EntityConverter = EntityConverter;
