import {BlobService, createBlobService, common, AccessCondition} from 'azure-storage'
import { EntityConverter } from "./core/entityConverter";       //引入 实体转换器

export class AzureBlob {    //微软的 blob 存储
    
    protected service: BlobServiceAsync;        //定义类型
    protected containerName: string;            //容器名称：定义类型
    //保存所有容器的名称。用于检查Blob中是否
    protected checkedContainers: { [name: string]: Promise<BlobService.ContainerResult>; } = {}; 
    //参数一： 连接地址 。    参数二： 容器名称（可能是存储数据的容器名称） 
    public constructor(connectionString: string, containerName: string) {
        this.service = createBlobService(connectionString) as BlobServiceAsync;     //创建一个Blob服务客户端对象
        this.containerName = containerName;     //保存容器名称

        //下边的方法，是把blobservice的这些方法都变成promise对象
        //如果容器不存在，则在指定帐户下创建新容器（这个容器感觉像是 数据库）。   通过 实体转换器，把回调函数 转成 promise对象
        this.service.createContainerIfNotExistsAsync = EntityConverter.denodeify(this.service, (this.service as BlobService).createContainerIfNotExists);
        //向blobService中创建、添加一个新的表？  或者是 存储、添加内容？
        this.service.appendBlockFromTextAsync = EntityConverter.denodeify(this.service, (this.service as BlobService).appendBlockFromText);
    }
    //获得容器（可能是数据库），传入 数据库名称。里面用于检查 容器名称是否存在
    private ensureContainer(containerName: string) {
        if (!this.checkedContainers[containerName]) {
            //如果不存在，那么就创建，并存入 用于检查 容器的对象
            this.checkedContainers[containerName] = this.service.createContainerIfNotExistsAsync(containerName);
        }

        return this.checkedContainers[containerName];
    }

    //添加内容
    public AppendText(content: string, blob: string) : Promise<boolean> {
        return this.ensureContainer(this.containerName)
            .then((created) => {
                //AppendBlobRequestOptions的意思是  附加blob请求选项。 也是一个ts接口
                let options: BlobService.AppendBlobRequestOptions = {} as any;
                // accessCondition是附加条件（接口interface） 的意思。  后边的方法意思是 ： 如果不存在则生成条件
                options.accessConditions = AccessCondition.generateIfNotExistsCondition();
                options.absorbConditionalErrorsOnRetry = true;      //在 重试时，吸收条件错误
                //然后存储 添加入内容
                return this.service.appendBlockFromTextAsync(this.containerName, blob, content, options);
            }).then((result) => {
                return true;        //添加成功，返回true
            },
            (reason) => {
                return false;       //添加失败，返回false
            });
    }
}

interface Map<T> {      //限制  对象格式 的接口
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