import {Config} from "../Config"

//环境类型
export enum EnvironmentType {
    Production,     //产品环境 0
    Staging,        //测试  1
    Development,        //开发环境  2
    LocalDevelopment        //本地开发环境  3
};

/**
 * Class to handles determing the current environment type. This is defined by environment
 * variable 'SLOT'. If a SLOT is not defined we look at Config parameters, otherwisen we
 * fallback to LocalDevelopment.
 */
export class Environment {
    
    public static isStaging(): boolean {
        //是否是 测试环境：  1
        return Environment.getEnvironmentType() == EnvironmentType.Staging;
    }
    
    public static isProduction(): boolean {
        //是否是 产品环境： 0
        return Environment.getEnvironmentType() == EnvironmentType.Production;
    }
    
    public static isDev(): boolean {
        //是否是  开发环境：  2
        return Environment.getEnvironmentType() === EnvironmentType.Development;
    }

    public static isLocalDev(): boolean {
        //是否是  本地开发环境   3
        return Environment.getEnvironmentType() === EnvironmentType.LocalDevelopment;
    }
    //获取环境类型
    public static getEnvironmentType(): EnvironmentType {
        //process.env属性返回一个包含用户环境信息的对象
        if (process.env.SLOT === 'development') {
            return EnvironmentType.Development      //  2
        } else if (process.env.SLOT === 'staging') {
            return EnvironmentType.Staging;         //  1
        } else if (process.env.SLOT === 'production') {
            return EnvironmentType.Production;      //  0
        } else {
            if (Config.environmentOverride) {
                return Config.environmentOverride;      //还是 EnvironmentType.LocalDevelopment     3
            }else {
                return EnvironmentType.LocalDevelopment;        //  3
            }
        }
    }
}