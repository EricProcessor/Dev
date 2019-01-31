// 引入下载好的数据库azure-storage中这里用到的模块
// TableQuery, 表查询
// TableService, 表服务
// TableUtilities,表实用程序
// createTableService, 创建表服务
// TableBatch, //表格批处理
// RetryPolicyFilter, 重试策略筛选器

//ErrorOrResult错误结果
// import {TableQuery, TableService, TableUtilities, createTableService, TableBatch, RetryPolicyFilter, ErrorOrResult} from "azure-storage";
import { EntityConverter } from "./core/entityConverter";   //实体转换
// import { StorageConfig } from "./StorageConfig"     //引入配置文件
import { Environment } from "./core/environment"
//import { Promise } from "./node_modules/@types/q";
import { connect } from "net";

var mongodb = require('mongodb');
//引入
var MongoClient = mongodb.MongoClient;
//jd---服务器连接地址
// let dbUrl = !Environment.isProduction()?'mongodb://root:Eq9RQ80J@jmongo-hb1-prod-mongo-t392nvqc111.jmiss.jdcloud.com:27017,jmongo-hb1-prod-mongo-t392nvqc112.jmiss.jdcloud.com:27017/admin?replicaSet=mgset-2242988359':'mongodb://127.0.0.1:27017/userInfo';
let UserName = process.env.UserName;
let Password = process.env.Password;
let JdMongoUrl = process.env.JdMongoUrl;
// let dbUrl = !Environment.isProduction()?'mongodb://'+UserName+':'+Password+'@'+JdMongoUrl+'/admin?replicaSet=mgset-2242988359':'mongodb://127.0.0.1:27017';
let dbUrl       //保存数据库连接 地址

var options = {
    auto_reconnect: true,
    useNewUrlParser: true,
    poolSize: 20
};
const mongoose = require("mongoose")		//引入
let AccountName   //引入mongoose模型    //引入mongoose模型
//定义  存储账户设置接口参数
export interface StorageAccountSettings {
    accessKey: string;       //访问密钥
    accountName: string;     //账户名称
    connectionString: string;        //连接地址
    //retryPolicy: RetryPolicyFilter.IRetryPolicy;        //重试策略
}
//定义Table表设置接口参数
export interface TableSetting extends StorageAccountSettings {
    tableName: string;  //表名称
    partitionKeyName: string;       //分区键名称
    rowKeyName: string;         //行键名称
    //entityResolver(enitityResult: object): object;      //重试策略
}
//定义  检索实体接口  参数
export interface RetrievedEntity<T> {
    exists: boolean;
    entity: T;
}
//定义TableService接口泛型
export class AzureTableService<T> {
    settings: T;
    //service: TableServiceAsync;
}

/**
* EntityResolver is used by Azure Storage retrival to convert the entity. It should be of type format: (entityResult: Object) => Object
*/
//EntityResolver是用于Azure存储转换实体。它应该是类型格式：(entityResult: Object) => Object
export interface EntityResolver {
    (entityResult: Object): Object;
}
//带约束的Azure存储转换实体方法
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
/**
*Azure包装器，承诺Azure存储功能。该表与泛型“模型”紧密关联。
*PartitionKey和RowKey当前通过表设置。
*该类的唯一缺点是当前创建行时复制分区键和行键。
*设计是故意这样保留的，因为表建议使用变体来分区键和行键，以便优化
*查询。由于写入表的成本较低，因此允许复制分区键和行键。
*到目前为止，只能重写行键值，我希望分区键总是相同的。
*/
//模板有个小问题，因为typescript不支持多个继承
export class MongodbTable<Model> { // Slight template hack as typescript doesn't support multiple inheritances.
    //protected service: TableServiceAsync;
    protected readonly setting: TableSetting;    //table表接口设置
    protected entityResolver;

    protected checkedTables: { [name: string]: Promise<any>; } = {};   //检查表是否存在

    constructor(setting: TableSetting) {
        /*mongodb中rowKeyName和partitionKeyName不是必填项-----注销
            if (!setting.rowKeyName || (setting.rowKeyName.length == 0) || !setting.partitionKeyName || (setting.rowKeyName.length == 0)) {
            throw new Error('PartitionKeyName & RowKeyName must be defined');
        }*/

        this.setting = setting;
        AccountName = require("../models/" + this.setting.tableName)    //引入mongoose模型
        //设置数据库连接地址
        if (setting.connectionString) {
            // this.service = <TableServiceAsync>createTableService(setting.connectionString);
            dbUrl = setting.connectionString
        }
        // mongoose连接数据库
        console.log(dbUrl)
        mongoose.connect(dbUrl + '/userInfo', {
            useNewUrlParser: true
        })
        // console.log("查看一下现在的表名称：" + setting.tableName)
        // // Connection string takes precedence
        //优先处理  连接地址

        // else {
        //     this.service = <TableServiceAsync>createTableService(this.setting.accountName, this.setting.accessKey);
        // }
        //上面处理后，this.service接收一个  新的table服务客户端对象

        // if (this.setting.retryPolicy) {     //重试策略
        //     this.service.withFilter(this.setting.retryPolicy);
        // }

        //this.entityResolver = this.setting.entityResolver || defaultEntityResolver;

        let denodeify = EntityConverter.denodeify;
        // //将下边的  table服务对象的 一些方法，都转成promise对象的方法
        // this.service.createTableIfNotExistsAsync = denodeify(this.service, (this.service as TableService).createTableIfNotExists);
        // this.service.deleteTableIfExistsAsync = denodeify(this.service, (this.service as TableService).deleteTableIfExists);
        //this.service.retrieveEntityAsync = denodeify(this.service, (this.service as TableService).any);
        // this.service.insertOrReplaceEntityAsync = denodeify(this.service, (this.service as TableService).insertOrReplaceEntity);
        // this.service.replaceEntityAsync = denodeify(this.service, (this.service as TableService).replaceEntity);
        // this.service.deleteEntityAsync = denodeify(this.service, (this.service as TableService).deleteEntity);
        // this.service.executeBatchAsync = denodeify(this.service, (this.service as TableService).executeBatch);
        // this.service.insertOrMergeAsync = denodeify(this.service, (this.service as TableService).insertOrMergeEntity);
    }
    //校验操作。判断是否有传入的 table表名称。没有的话，那就创建，并存入到 用于检查的存储table表名称的对象中
    // protected ensureTable(): Promise< {} > {
    //     let tableName = this.setting.tableName;
    //     if (!this.checkedTables[tableName]) {
    //         var server = new mongodb.Server(localUrl,{auto_reconnect:true});
    //         var db = new mongodb.Db(tableName,server,{safe:true});
    //         this.checkedTables[tableName] = db;
    //     }
    //     console.log("---------ensureTable-------------"+this.checkedTables[tableName])
    //     return this.checkedTables[tableName];
    // }
    //获取行key值
    protected getRowKey(rowKey: string, model: Model): string {
        return Object.is(rowKey, undefined) ? model[this.setting.rowKeyName] : rowKey;
    }

    public retrieve(model: Model, rowKey: string = undefined): Promise<RetrievedEntity<Model>> {
        console.log("进入retrieve方法");
        console.log("AzureTabl数据库连接地址" + dbUrl)
        let retrievedEntity: RetrievedEntity<Model> = {} as any;
        return AccountName.findOne(model).then(final => {
            if (final) {
                retrievedEntity.entity = final as Model;
                retrievedEntity.exists = true;
            } else {
                retrievedEntity.entity = final as Model;
                retrievedEntity.exists = false;
            }
            console.log("final+" + JSON.stringify(final));
            return retrievedEntity
        }).catch(err => {
            console.log("进入retrieve方法数据库err");
            if (err.statusCode === 404) {
                retrievedEntity.exists = false;
            } else {
                console.log("Retrieve User Error:" + err);
                throw err;
            }
            return retrievedEntity;
        })
    }


    /**
     * Trys to insert or merge an entity into the table. Values that are undefined will not be replaced for existing entities.
     * Note: All number values will be set to Int32
     * @param model The entity that will be inserted.
     */
    /**
    *尝试将实体（内容）插入或合并到表中。未定义的值将不会被现有实体替换。
    *注意：所有数字值都将设置为Int32
    *@param模型将被插入的实体。
    */
    public async insertOrMerge(model: Model): Promise<void> {
        console.log("进入insertOrMerge")
        return AccountName.findOne({
            "unique_name": model["unique_name"]
        }).then(final => {
            if (final) {
                console.log("insertOrMerge更新数据");
                return AccountName.where({
                    "unique_name": model["unique_name"]
                }).update({
                    $set: model
                }).then((error, result) => {
                    if (error) {
                        console.log(error);
                    }
                    return result
                })
            } else {
                console.log("insertOrMerge插入数据");
                return AccountName.create(
                    model
                    , (err, docs) => {
                        if (err) { console.log(err) }
                        else {
                            console.log("数据添加成功")
                        }
                    })
            }
        }).catch(err => {
            (error) => {
                throw error;
            }
        })
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
    public async insertOrReplace(model: Model): Promise<void> {
        return AccountName.findOne({
            "unique_name": model["unique_name"]
        }).then(final => {
            if (final) {
                console.log("insertOrMerge更新数据");
                return AccountName.where({
                    "unique_name": model["unique_name"]
                }).update({
                    $set: model
                }).then((error, result) => {
                    if (error) {
                        console.log(error);
                    }
                    return result
                })
            } else {
                console.log("insertOrMerge插入数据");
                return AccountName.create(
                    model
                    , (err, docs) => {
                        if (err) { console.log(err) }
                        else {
                            console.log("数据添加成功")
                        }
                        return docs
                    })
            }
        }).catch(err => {
            (error) => {
                throw error;
            }
        })
    }
    //删除某个数据的方法
    public async delete(query: any): Promise<any> {
        console.log("")
        return AccountName.where({
            "unique_name": query
        }).remove().then((error, result) => {
            if (error) {
                console.log("数据库删除失败")
            }
            return result
        })
    }

    //删除某个表
    public async deleteTable(query: string): Promise<void> {
        return MongoClient.connect(dbUrl, options).then(
            client => {
                return client.db("userInfo").dropCollection(query).then((error, result) => {
                    if (error) {
                        console.log("数据库删除失败")
                    }
                    client.close()
                    return result
                })
            }
        )
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
    //批量数据插入
    public async batchInsertEntity(models: Model[], ignoreUndefined: boolean = false): Promise<void> {
        // let tableBatch = new TableBatch();
        // return this.ensureTable()
        //         .then((created) => {
        //             models.forEach((model) => {
        //                 const entity = EntityConverter.convertToEntity(model[this.setting.partitionKeyName], model[this.setting.rowKeyName], model, ignoreUndefined);
        //                 tableBatch.insertOrReplaceEntity(entity);
        //             });

        //             return this.service.executeBatchAsync(this.setting.tableName, tableBatch);
        //         });
        console.log("批量数据插入");
        return
    }

    //查询实体（内容）
    public queryEntities(query) {
        return new Promise<Model[]>((resolve, reject) => {
            this.queryTillEnd(query, resolve, reject);
        });
    }

    //查询到结束
    private async queryTillEnd(query, resolve, reject) {
        let msg //用于保存搜索到的信息
        //查询操作
        AccountName.find(query, { _id: 0 }).then((result) => {
            if (result) {
                console.log("111" + JSON.stringify(result))
                resolve(result[0]) //在这里返回数据
            } else {
                //没有查询到数据
                reject()
            }

        })

    }

    //查询
    public async findOne(collection, whereObj): Promise<any> {
        console.log("进入findOne查询方法")
        return AccountName.findOne(whereObj).then((err, results) => {
            if (!err) {
                MongoClient.close();
                return results
            } else {
                console.log("失败");
            }
        })

        // return MongoClient.connect(dbUrl, options).then((err, result) => {

        //     if (err) {
        //         console.log("失败");
        //     } else {
        //         var db = MongoClient.db("User");
        //         console.log("连接数据库成功")
        //         db.collection(collection).findOne(whereObj).then((err, results) => {
        //             if (!err) {
        //                 MongoClient.close();
        //                 return results
        //             }
        //         })
        //     }
        // })
    }
}
//定义接口
// interface TableServiceAsync {
//     //检测表是否存在
//     createTableIfNotExistsAsync(table: string): Promise<any>;
//     //表如果存在执行删除
//     deleteTableIfExistsAsync(table: string): Promise<boolean>;
//     //获取刚刚插入的实体
//     retrieveEntityAsync<T>(table: string, partitionKey: string, rowKey: string, options: any): Promise<T>;
//     //更新操作
//     replaceEntityAsync<T>(table: string, entityDescriptor: T): Promise<any>;
//     //插入操作
//     insertOrReplaceEntityAsync<T>(table: string, entityDescriptor: T): Promise<any>;
//     //删除操作
//     deleteEntityAsync<T>(table: string, entityDescriptor: T): Promise<void>;
//     //执行批量处理
//     executeBatchAsync<T>(table: string, tableBatch: TableBatch): Promise<void>;
//     //插入合并操作
//     insertOrMergeAsync<T>(table: string, entityDescriptor: T): Promise<void>;
// }

