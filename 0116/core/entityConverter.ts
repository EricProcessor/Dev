//import { TableUtilities } from "azure-storage";

export type EntityValueTypes = string | boolean | number | Date;
export type EntityValues = { [key: string]: EntityValueTypes };
//创建实体的方法
//var entGen = TableUtilities.entityGenerator;

interface IEntityProperty<T> {
    _: T;
}

export class EntityConverter {
    public static map<TK>(entity): TK {
        var mapped = {} as TK;
        Object.keys(entity).forEach((key) => {
            var prop: IEntityProperty<any> = entity[key];
            mapped[key] = prop ? prop._ : null;
        });
        return mapped;
    }

    // Use this to convert callback into a promise (Taken from botbuilder-azure)
    public static denodeify<T>(thisArg: any, fn: Function): (...args: any[]) => Promise<T> {
        return (...args: any[]) => {
            return new Promise<T>((resolve, reject) => {
                args.push((error: Error, result: any) => {
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
    //将给定对象转换为Azure实体。
    public static convertToEntity(partitionKey: string, rowKey: string, values: { [key: string]: any }, ignoreUndefined: boolean) {
        const entity = Object.getOwnPropertyNames(values).reduce((o, k) => {
            let val = EntityConverter.convertToEntityValue(values[k]);
            if (!((val === undefined) && ignoreUndefined)) {
                o[k] = val;
            }
            return o;
        }, {} as { [key: string]: any });

        // entity.PartitionKey = entGen.String(partitionKey);
        // entity.RowKey = entGen.String(rowKey);
        entity.PartitionKey = String(partitionKey);
        entity.RowKey = String(rowKey);

        return entity;
    }
    //转换到实体
    public static convertToEntityValue(value: EntityValueTypes): any {
        if (typeof value === 'undefined') {
            return undefined;
        } else if (value === undefined) {
            return undefined;
        } else if (value === null) {
            return undefined;
        } else if (typeof value === 'string') {
            //return entGen.String(value);
            return String(value);
        } else if (typeof value === 'boolean') {
            //return entGen.Boolean(value);
            return Boolean(value);
        } else if (typeof value === 'number') {
            if (Math.floor(value) === value) {
                //return entGen.Int32(value);
                return Number(value);
            } else {
                // return entGen.Double(value);
                return value.toFixed(2);
            }
        } else if (value instanceof Date) {
            //return entGen.DateTime(value);
            return new Date(value);
        } else { // if (typeof value === 'object') {
            // return entGen.String(JSON.stringify(value));
            return JSON.stringify(value);
        }
    }
}