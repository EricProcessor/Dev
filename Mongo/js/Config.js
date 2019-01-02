"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./core/environment");
//配置环境文件
class Config {
    constructor() {
        this.environmentOverride = environment_1.EnvironmentType.LocalDevelopment;
    }
}
Config.startingTrialCountTeacher = 25;
Config.startingTrialCountStudent = 10;
Config.licenseCacheDuration = 30;
Config.roleCheckCacheDuration = 7;
Config.readFromNewUserTable = true;
Config.switchToNewSigninTelemetryTable = true;
Config.returnAnonimizedId = true;
// Local Development was introduced to help running against emulators. But with current local tests we
// want to be able to hit the main servers. This option will let developers decide what mode they want to run with local emulator or not.
// Eg. When testing the server locally, this should be set to false.
// Future: Global functions are created on module load and before app is initalized. If you use this globally, you need to set it before a
// the storage table settings is run. At some point we will make everything into classes so initalization is cleaner.
//引入本地开发以帮助运行模拟器。但是通过当前的本地测试，我们
//希望能够命中主服务器。这个选项将让开发人员决定他们想用本地模拟器运行什么模式。
//Eg.在本地测试服务器时，应该将其设置为false。
//未来：在模块加载和应用程序初始化之前，创建全局函数。如果全局使用它，则需要在
//运行存储表设置。在某个时候，我们将把一切都编入类，因此初始化更干净。
Config.useLocalEmulator = true;
Config.useBlobForLogging = false;
// Logs all info about the tenant.
Config.logVerboseEnabledForTenant = ["4a88a673-d0e3-45a7-a44c-1f03feb1df60"];
exports.Config = Config;
//# sourceMappingURL=Config.js.map