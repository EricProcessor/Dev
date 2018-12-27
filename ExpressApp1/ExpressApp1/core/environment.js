"use strict";
exports.__esModule = true;
var Config_1 = require("../Config");
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
var Environment = /** @class */ (function () {
    function Environment() {
    }
    Environment.isStaging = function () {
        return Environment.getEnvironmentType() == EnvironmentType.Staging;
    };
    Environment.isProduction = function () {
        return Environment.getEnvironmentType() == EnvironmentType.Production;
    };
    Environment.isDev = function () {
        return Environment.getEnvironmentType() === EnvironmentType.Development;
    };
    Environment.isLocalDev = function () {
        return Environment.getEnvironmentType() === EnvironmentType.LocalDevelopment;
    };
    Environment.getEnvironmentType = function () {
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
    };
    return Environment;
}());
exports.Environment = Environment;
