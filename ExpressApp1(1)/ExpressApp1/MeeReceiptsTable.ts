import {AzureTable, TableSetting, RetrievedEntity} from "./AzureTable"
import { TableQuery } from 'azure-storage'

/**
 * User Schema that is used to create the table.
 * 
 * Warning: Modifying this will impact the table schema.
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
        return this.queryEntities(new TableQuery().where('RowKey eq ?', transactionId));
    }

    public getAllWithAnonimizedOid(anonimizedOid: string) : Promise<Receipt[]> {
        return this.queryEntities(new TableQuery().where('PartitionKey eq ?', anonimizedOid));
    }
}

