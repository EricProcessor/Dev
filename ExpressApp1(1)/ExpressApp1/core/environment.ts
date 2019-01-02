//该文件用来设置环境变量
import {RetryPolicyFilter} from "azure-storage"
import {Config} from "../Config"

export enum EnvironmentType {   //设置枚举类型
    Production,
    Staging,
    Development,
    LocalDevelopment
};

/**
 * Class to handles determing the current environment type. This is defined by environment
 * variable 'SLOT'. If a SLOT is not defined we look at Config parameters, otherwisen we
 * fallback to LocalDevelopment.
 * 
 * 这个类来确定当前环境类型。这是由环境变量'slot'来定义的

*  如果没有定义slot，我们就查看配置参数，否则的话就回退到本地开发环境。
 */
export class Environment {
    
    public static isStaging(): boolean {        //是否是工作台
        return Environment.getEnvironmentType() == EnvironmentType.Staging;
    }
    
    public static isProduction(): boolean {     //是否是 生产环境
        return Environment.getEnvironmentType() == EnvironmentType.Production;
    }
    
    public static isDev(): boolean {        //是否是开发环境
        return Environment.getEnvironmentType() === EnvironmentType.Development;
    }

    public static isLocalDev(): boolean {       //是否是本地开发环境
        return Environment.getEnvironmentType() === EnvironmentType.LocalDevelopment;
    }
    //获取环境类型
    public static getEnvironmentType(): EnvironmentType {
        //process.env属性返回一个包含用户环境信息的对象

        //判断现在的环境类型
        if (process.env.SLOT === 'development') {
            return EnvironmentType.Development
        } else if (process.env.SLOT === 'staging') {
            return EnvironmentType.Staging;
        } else if (process.env.SLOT === 'production') {
            return EnvironmentType.Production;
        } else {
            if (Config.environmentOverride) {       //查看 config配置中的 环境信息
                return Config.environmentOverride;
            }else {
                return EnvironmentType.LocalDevelopment;
            }
        }
    }
}