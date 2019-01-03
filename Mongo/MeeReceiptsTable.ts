import {AzureTable, TableSetting, RetrievedEntity} from "./AzureTable"
//import { TableQuery } from 'azure-storage'

/**
 * User Schema that is used to create the table. 用于创建表的用户架构
 * 
 * Warning: Modifying this will impact the table schema. 警告：修改此项将影响表架构
 */
export interface Receipt {
    anonimizedOid: string,
    transactionId: string,
    expirationDate: Date,
    tenantId: string
}

export class ReceiptsTable extends AzureTable<Receipt> {
    constructor(setting: TableSetting) {
        super(setting);
    }

    public getAllWithTransactionId(transactionId: string) : Promise<Receipt[]> {
        //return this.queryEntities(new TableQuery().where('RowKey eq ?', transactionId));
        return this.queryEntities({'RowKey':transactionId});
    }

    public getAllWithAnonimizedOid(anonimizedOid: string) : Promise<Receipt[]> {
        //return this.queryEntities(new TableQuery().where('PartitionKey eq ?', anonimizedOid));
        return this.queryEntities({'PartitionKey':anonimizedOid});
    }
}

