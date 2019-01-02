"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AzureTable_1 = require("./AzureTable");
const azure_storage_1 = require("azure-storage");
class ReceiptsTable extends AzureTable_1.AzureTable {
    constructor(setting) {
        super(setting);
    }
    getAllWithTransactionId(transactionId) {
        return this.queryEntities(new azure_storage_1.TableQuery().where('RowKey eq ?', transactionId));
    }
    getAllWithAnonimizedOid(anonimizedOid) {
        return this.queryEntities(new azure_storage_1.TableQuery().where('PartitionKey eq ?', anonimizedOid));
    }
}
exports.ReceiptsTable = ReceiptsTable;
//# sourceMappingURL=MeeReceiptsTable.js.map