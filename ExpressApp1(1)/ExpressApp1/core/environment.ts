import {RetryPolicyFilter} from "azure-storage"
import {Config} from "../Config"

export enum EnvironmentType {
    Production,
    Staging,
    Development,
    LocalDevelopment
};

/**
 * Class to handles determing the current environment type. This is defined by environment
 * variable 'SLOT'. If a SLOT is not defined we look at Config parameters, otherwisen we
 * fallback to LocalDevelopment.
 */
export class Environment {
    
    public static isStaging(): boolean {
        return Environment.getEnvironmentType() == EnvironmentType.Staging;
    }
    
    public static isProduction(): boolean {
        return Environment.getEnvironmentType() == EnvironmentType.Production;
    }
    
    public static isDev(): boolean {
        return Environment.getEnvironmentType() === EnvironmentType.Development;
    }

    public static isLocalDev(): boolean {
        return Environment.getEnvironmentType() === EnvironmentType.LocalDevelopment;
    }
    //获取环境类型
    public static getEnvironmentType(): EnvironmentType {
        //process.env属性返回一个包含用户环境信息的对象
        if (process.env.SLOT === 'development') {
            return EnvironmentType.Development
        } else if (process.env.SLOT === 'staging') {
            return EnvironmentType.Staging;
        } else if (process.env.SLOT === 'production') {
            return EnvironmentType.Production;
        } else {
            if (Config.environmentOverride) {
                return Config.environmentOverride;
            }else {
                return EnvironmentType.LocalDevelopment;
            }
        }
    }
}