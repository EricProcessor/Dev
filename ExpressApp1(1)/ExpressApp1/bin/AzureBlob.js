"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const azure_storage_1 = require("azure-storage");
const entityConverter_1 = require("./core/entityConverter");
class AzureBlob {
    constructor(connectionString, containerName) {
        this.checkedContainers = {};
        this.service = azure_storage_1.createBlobService(connectionString);
        this.containerName = containerName;
        this.service.createContainerIfNotExistsAsync = entityConverter_1.EntityConverter.denodeify(this.service, this.service.createContainerIfNotExists);
        this.service.appendBlockFromTextAsync = entityConverter_1.EntityConverter.denodeify(this.service, this.service.appendBlockFromText);
    }
    ensureContainer(containerName) {
        if (!this.checkedContainers[containerName]) {
            this.checkedContainers[containerName] = this.service.createContainerIfNotExistsAsync(containerName);
        }
        return this.checkedContainers[containerName];
    }
    AppendText(content, blob) {
        return this.ensureContainer(this.containerName)
            .then((created) => {
            let options = {};
            options.accessConditions = azure_storage_1.AccessCondition.generateIfNotExistsCondition();
            options.absorbConditionalErrorsOnRetry = true;
            return this.service.appendBlockFromTextAsync(this.containerName, blob, content, options);
        }).then((result) => {
            return true;
        }, (reason) => {
            return false;
        });
    }
}
exports.AzureBlob = AzureBlob;
//# sourceMappingURL=AzureBlob.js.map