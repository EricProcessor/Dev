"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import {RetryPolicyFilter} from "azure-storage"
const Config_1 = require("../Config");
var EnvironmentType;
(function (EnvironmentType) {
    EnvironmentType[EnvironmentType["Production"] = 0] = "Production";
    EnvironmentType[EnvironmentType["Staging"] = 1] = "Staging";
    EnvironmentType[EnvironmentType["Development"] = 2] = "Development";
    EnvironmentType[EnvironmentType["LocalDevelopment"] = 3] = "LocalDevelopment";
})(EnvironmentType = exports.EnvironmentType || (exports.EnvironmentType = {}));
;
/**
 * Class to handles determing the current environment type. This is defined by environment
 * variable 'SLOT'. If a SLOT is not defined we look at Config parameters, otherwisen we
 * fallback to LocalDevelopment.
 */
class Environment {
    static isStaging() {
        return Environment.getEnvironmentType() == EnvironmentType.Staging;
    }
    static isProduction() {
        return Environment.getEnvironmentType() == EnvironmentType.Production;
    }
    static isDev() {
        return Environment.getEnvironmentType() === EnvironmentType.Development;
    }
    static isLocalDev() {
        return Environment.getEnvironmentType() === EnvironmentType.LocalDevelopment;
    }
    //获取环境类型
    static getEnvironmentType() {
        //process.env属性返回一个包含用户环境信息的对象
        if (process.env.SLOT === 'development') {
            return EnvironmentType.Development;
        }
        else if (process.env.SLOT === 'staging') {
            return EnvironmentType.Staging;
        }
        else if (process.env.SLOT === 'production') {
            return EnvironmentType.Production;
        }
        else {
            if (Config_1.Config.environmentOverride) {
                return Config_1.Config.environmentOverride;
            }
            else {
                return EnvironmentType.LocalDevelopment;
            }
        }
    }
}
exports.Environment = Environment;
//# sourceMappingURL=environment.js.map