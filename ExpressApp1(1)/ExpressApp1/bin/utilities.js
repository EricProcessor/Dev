"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function replacePipesWithLineFeeds(s) {
    return s.replace(/\|/g, '\x0A');
}
exports.replacePipesWithLineFeeds = replacePipesWithLineFeeds;
function getHeadCommit() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            require('child_process').exec('git rev-parse HEAD', function (err, stdout) {
                if (err) {
                    reject("");
                }
                else {
                    resolve(stdout);
                }
            });
        });
    });
}
exports.getHeadCommit = getHeadCommit;
//# sourceMappingURL=utilities.js.map