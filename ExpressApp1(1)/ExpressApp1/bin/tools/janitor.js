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
const AzureHelper = require("../AzureHelper");
function deleteUser(unique_name) {
    return __awaiter(this, void 0, void 0, function* () {
        let entity = yield AzureHelper.queryEntityRowKey(AzureHelper.Table.Users, unique_name);
        AzureHelper.deleteEntity(AzureHelper.Table.Users, entity);
    });
}
function deleteAll() {
    return __awaiter(this, void 0, void 0, function* () {
        for (var i = 11; i <= 45; i++) {
            var name = `stu${i}@usmie.com`;
            console.log(name);
            yield deleteUser(name);
        }
    });
}
function deleteSome(list) {
    return __awaiter(this, void 0, void 0, function* () {
        for (var name of list) {
            console.log(name);
            yield deleteUser(name);
        }
    });
}
//deleteAll();
var toDelete = [
    "teacher1@bmseatestprodbnwd.onmicrosoft.com",
    "teacher12@bmseatestprodbnwd.onmicrosoft.com",
    "student1@bmseatestprodbnwd.onmicrosoft.com",
    "student21@bmseatestprodbnwd.onmicrosoft.com",
    "student1@iwsignuptest35d1d471faf04565978f549b6041cdde.edu",
    "student3@iwsignuptest35d1d471faf04565978f549b6041cdde.edu",
    "student1@iwsignuptest1247c7fbeb594428b1cfc0fa93866f55.edu",
    "student3@iwsignuptest1247c7fbeb594428b1cfc0fa93866f55.edu",
    "teacher@iwsignuptest35d1d471faf04565978f549b6041cdde.edu",
    "teacher2@iwsignuptest35d1d471faf04565978f549b6041cdde.edu",
    "teacher3@iwsignuptest35d1d471faf04565978f549b6041cdde.edu",
    "testera@lincolncove.com",
    "tester2@lincolncove.com-tester3@lincolncove.com",
    "teach2@experienceoffice.com-teach10@experienceoffice.com",
    "stu5@experienceoffice.com-stu10@experienceoffice.com"
];
deleteSome(toDelete);
//# sourceMappingURL=janitor.js.map