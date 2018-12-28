import {BlobService, createBlobService, common, AccessCondition} from 'azure-storage'
import { EntityConverter } from "./core/entityConverter";

export class AzureBlob {
 
    protected service: BlobServiceAsync;
    protected containerName: string;

    protected checkedContainers: { [name: string]: Promise<BlobService.ContainerResult>; } = {};

    public constructor(connectionString: string, containerName: string) {
        this.service = createBlobService(connectionString) as BlobServiceAsync;
        this.containerName = containerName;

        this.service.createContainerIfNotExistsAsync = EntityConverter.denodeify(this.service, (this.service as BlobService).createContainerIfNotExists);
        this.service.appendBlockFromTextAsync = EntityConverter.denodeify(this.service, (this.service as BlobService).appendBlockFromText);
    }

    private ensureContainer(containerName: string) {
        if (!this.checkedContainers[containerName]) {
            this.checkedContainers[containerName] = this.service.createContainerIfNotExistsAsync(containerName);
        }

        return this.checkedContainers[containerName];
    }

    public AppendText(content: string, blob: string) : Promise<boolean> {
        return this.ensureContainer(this.containerName)
            .then((created) => {
                let options: BlobService.AppendBlobRequestOptions = {} as any;
                options.accessConditions = AccessCondition.generateIfNotExistsCondition();
                options.absorbConditionalErrorsOnRetry = true;

                return this.service.appendBlockFromTextAsync(this.containerName, blob, content, options);
            }).then((result) => {
                return true;
            },
            (reason) => {
                return false;
            });
    }
}

interface Map<T> {
    [index: string]: T;
  }

interface BlobServiceAsync extends BlobService {
    createContainerIfNotExistsAsync(containerName: string) : Promise<BlobService.ContainerResult>;
    appendBlockFromTextAsync(container: string, blob: string, content: string | Buffer, options: BlobService.AppendBlobRequestOptions) : Promise<BlobService.BlobResult>;
    /*    
    doesContainerExistAsync(container: string) : Promise<BlobService.ContainerResult>;
    createContainerIfNotExistsAsync(container: string) : Promise<BlobService.ContainerResult>;
    getContainerPropertiesAsync(container: string) : Promise<BlobService.ContainerResult>;
    getContainerMetadataAsync(container: string) : Promise<BlobService.ContainerResult>;
    setContainerMetadataAsync(container: string, metadata: Map<string>) : Promise<BlobService.ContainerResult>;
    getContainerAclAsync(container: string) : Promise<BlobService.ContainerAclResult>;
    setContainerAclAsync(container: string, signedIdentifiers: {[key:string]: common.AccessPolicy}) : Promise<BlobService.ContainerAclResult>;
    deleteContainerIfExistsAsync(container: string) : Promise<boolean>;
     */
}