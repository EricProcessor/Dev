"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guid_1 = require("../core/guid");
class RandomGenerator {
    constructor() {
        this.names = ['Yash', 'George', 'Divya', 'Jeff', 'Will', 'Barry', 'Ramon', 'John', 'Jasmine', 'Allison', 'nick', 'Shroff', 'Mok', 'Smith', 'Clovin', 'Mck', 'Olson', 'Pro', 'Blake', 'Costa', 'Cooper', 'Carl', 'Ryder', 'Harmon', 'Matthews', 'Quarnstorm', 'Storm', 'Severson', 'Meeno', 'Daniel', 'Beasley', 'Brian', 'Chris', 'Jared', 'Kyle', 'Nova', 'Mark', 'Mccallister', 'Hilary', 'Albert', 'Victoria'];
        this.emails = ['@microsoft.com', '@gmail.com', '@live.com', '@hotmail.com', '@rocketmail.com'];
        this.roles = ['student', 'teacher'];
    }
    Integer(min = 1, max = 100) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    rand(list) {
        return list[Math.floor(Math.random() * list.length)];
    }
    GenerateName() {
        return this.rand(this.names) + ' ' + this.rand(this.names);
    }
    GenerateEmailFromName(userName) {
        return userName.replace(' ', '').toLowerCase() + this.Integer(0, 1000) + this.rand(this.emails);
    }
    GenerateRandomLicenseType() {
        return 'license-query-licenced-000' + Math.floor((Math.random() * 10));
    }
    GenerateRandomDate(rangeOfDays, hourRange) {
        var today = new Date(Date.now());
        return new Date(today.getFullYear() + 1900, today.getMonth(), today.getDate() + Math.random() * rangeOfDays, Math.random() * hourRange, Math.random() * 60);
    }
    GenerateUserID(tenantId = undefined, unique_name = undefined, oid = undefined) {
        let user = {};
        {
            user.name = this.GenerateName();
            user.tenantId = tenantId ? tenantId : guid_1.Guid.newGuid();
            user.unique_name = unique_name ? unique_name : this.GenerateEmailFromName(user.name);
            user.osVersion = this.rand(['Microsoft Windows NT 6.2.9200.0', 'MacOS Version 10.12 (Build 16A319)', 'MacOS 10.12', 'Windows 10.0.14393.0']);
            user.clientDisplayVersion = '1.0.28';
            user.clientApplication = this.rand(['Minecraft', 'ClassroomMode']);
            user.oid = oid ? oid : guid_1.Guid.newGuid();
        }
        return user;
    }
    GenerateUser(tenantId = undefined) {
        let user = {};
        user.anonimizedOid = guid_1.Guid.newGuid();
        return Object.assign({}, user, this.GenerateuserWithoutAoid(tenantId));
    }
    GenerateuserWithoutAoid(tenantId = undefined) {
        let user = {};
        user.name = this.GenerateName();
        user.unique_name = this.GenerateEmailFromName(user.name);
        user.isLicensed = Math.random() >= 0.5;
        if (user.isLicensed) {
            user.licenseType = this.GenerateRandomLicenseType();
            user.lastLicenseCheck = this.GenerateRandomDate(10, 20);
        }
        user.role = this.rand(this.roles);
        user.lastRoleCheck = this.GenerateRandomDate(1, 4);
        user.nickname = user.name.split(' ', 1)[0] + 'N';
        user.tenantId = tenantId || guid_1.Guid.newGuid();
        user.oid = guid_1.Guid.newGuid();
        user.skin = this.rand(this.names) + this.rand(this.names) + this.rand(this.names);
        user.trailsUsed = this.Integer(0, 20);
        user.trialsAllowed = this.Integer(20, 30);
        return user;
    }
}
exports.RandomGenerator = RandomGenerator;
//# sourceMappingURL=RandomGenerator.js.map