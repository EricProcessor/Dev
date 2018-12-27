"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AzureTable_1 = require("./AzureTable");
const azure_storage_1 = require("azure-storage");
const guid_1 = require("./core/guid");
const Config_1 = require("./Config");
class UserTable extends AzureTable_1.AzureTable {
    constructor(setting) {
        super(setting);
        this.oidAsRowKey = false;
        this.defaultSkin = "EduSkins_Alex";
        this.defaultAcceptedEula = false;
        this.startingTrialCountTeacher = 25;
        this.startingTrialCountStudent = 10;
    }
    set(userID, func) {
        if (!userID.tenantId || !userID.oid) {
            throw new Error(`set: Incorrect userID passed, need to contain both tenantId and oid`);
        }
        return this.get(userID).then((entity) => {
            if (entity.exists) {
                let userToUpdate = {};
                userToUpdate.tenantId = userID.tenantId;
                userToUpdate.oid = userID.oid;
                userToUpdate.unique_name = userID.unique_name;
                userToUpdate = func(userToUpdate);
                return this.insertOrMerge(userToUpdate);
            }
            else {
                // Write a log
                throw new Error(`set: Unable to update skin, user does not exist. tenantId: '${userID.tenantId}', oid: '${userID.oid}'.`);
            }
        }, (reason) => { throw new Error(`set Failed: ${reason}`); });
    }
    setTrialCounts(userID, trialsAllowed, trialsUsed) {
        return this.set(userID, (user) => {
            user.trialsAllowed = trialsAllowed;
            user.trialsUsed = trialsUsed;
            return user;
        });
    }
    setSkin(userID, skin) {
        return this.set(userID, (user) => {
            user.skin = skin;
            return user;
        });
    }
    updateEula(userID, acceptedEula = true) {
        return this.set(userID, (user) => {
            user.acceptedEula = acceptedEula;
            return user;
        });
    }
    querybyUniqueName(unique_name) {
        let stringFilter = azure_storage_1.TableQuery.stringFilter('unique_name', azure_storage_1.TableUtilities.QueryComparisons.EQUAL, unique_name);
        let query = (new azure_storage_1.TableQuery()).where(stringFilter);
        return this.queryEntities(query);
    }
    queryAllUsers() {
        let query = new azure_storage_1.TableQuery();
        return this.queryEntities(query);
    }
    get(userID) {
        let user = {};
        user.tenantId = userID.tenantId;
        user.oid = userID.oid;
        user.unique_name = userID.unique_name;
        return this.retrieve(user);
    }
    addNewUser(userID, role, isLicensed, licenseType, anonimizedOid) {
        let date = new Date();
        return this.updateExistingUser(userID, {}, role, date, isLicensed, licenseType, date, anonimizedOid);
    }
    // Design: I tried to use InsertAndMerge here, but it seems like we need to return the user object. Might be better to just construct the final object and call replace.
    //  Or merge the object together when we return.
    updateExistingUser(userID, cachedUser, role, lastRoleCheck, isLicensed, licenseType, lastLicenseCheck, anonimizedOid = undefined) {
        // sign in user, but don't bother with checking or decrementing trial counts if user is licensed
        let remainingTrialCount = 0;
        let userToUpdate = {};
        {
            // Due to multi user scenarios we will update everything.
            userToUpdate.tenantId = cachedUser.tenantId || userID.tenantId;
            userToUpdate.unique_name = cachedUser.unique_name || userID.unique_name;
            userToUpdate.lastRoleCheck = lastRoleCheck;
            userToUpdate.lastLicenseCheck = lastLicenseCheck;
            userToUpdate.role = role;
            userToUpdate.name = userID.name;
            userToUpdate.oid = userID.oid;
            userToUpdate.anonimizedOid = cachedUser.anonimizedOid || anonimizedOid || guid_1.Guid.newGuid();
            userToUpdate.skin = cachedUser.skin || this.defaultSkin;
            userToUpdate.nickname = this.GetUserNickname(userID.name, userID.userName);
            // It is possible that the user came in through the classroom mode signin, in which case we don't currently do a license check.
            userToUpdate.isLicensed = isLicensed;
            userToUpdate.licenseType = licenseType;
            if (role === "teacher") {
                userToUpdate.acceptedEula = cachedUser.acceptedEula || this.defaultAcceptedEula;
            }
            // Handle new trials. 
            if (role !== cachedUser.role) {
                userToUpdate.trialsAllowed = (role === "teacher" ? Config_1.Config.startingTrialCountTeacher : Config_1.Config.startingTrialCountStudent);
            }
        }
        // If user is not licenced setup trials
        if (!isLicensed) {
            let numTrialsAllowed;
            if (cachedUser.trialsAllowed) {
                numTrialsAllowed = cachedUser.trialsAllowed;
            }
            else {
                numTrialsAllowed = (role === "teacher" ? Config_1.Config.startingTrialCountTeacher : Config_1.Config.startingTrialCountStudent);
                userToUpdate.trialsAllowed = numTrialsAllowed;
            }
            let numTrialsUsed;
            if (cachedUser.trialsUsed) {
                numTrialsUsed = cachedUser.trialsUsed + 1;
            }
            else {
                numTrialsUsed = 1;
            }
            remainingTrialCount = numTrialsAllowed - numTrialsUsed;
            if (remainingTrialCount >= 0) {
                userToUpdate.trialsUsed = numTrialsUsed;
            }
        }
        /* Need to fix the logging
           let startTime = Date.now();
           let duration = Date.now() - startTime;
           trackDependency("azure-storage/meeservicesstorage", "updateEntity", duration, true);
           await logActivityVerbose('signin-azurehelper-updateentity', user.tenantId, user.unique_name, userEntity.azureResult);
       */
        return this.insertOrMerge(userToUpdate).then(() => {
            let userInfo = {};
            {
                userInfo.remainingTrialCount = remainingTrialCount;
                // Merge both objects.
                userInfo.user = Object.assign({}, cachedUser, userToUpdate);
            }
            return userInfo;
        });
    }
    storeExperienceState(user) {
        // Replace so that experience state can be reduced
        return this.insertOrReplace(user).then(() => {
            return user;
        });
    }
    GetUserNickname(name, userName) {
        let minecraftName = this.getMinecraftName(name, userName);
        let nameParts = minecraftName.split(' ');
        let playerName = nameParts[0];
        if (nameParts.length > 1 && nameParts[1].length > 0) {
            playerName += nameParts[1][0];
        }
        return playerName.substring(0, 16);
    }
    // Return the user's name based on their "human name", if it contains ASCII characters,
    // otherwise use the player's "userName" (which is either upn or email) and guaranteed to be
    // made up of ASCII characters.
    getMinecraftName(name, userName) {
        const re = /^[_ ]+$/;
        const encodedName = this.encodeName(name);
        if (encodedName.match(re)) {
            return this.encodeName(userName);
        }
        else {
            return encodedName;
        }
    }
    encodeName(name) {
        const legalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_ ";
        let encodedName = "";
        for (let i = 0; i < name.length; ++i) {
            if (legalChars.indexOf(name[i]) >= 0) {
                encodedName += name[i];
            }
            else {
                encodedName += name[i] === '@' ? " " : "_";
            }
        }
        return encodedName;
    }
    groupBy(array, condition, modifier, selector) {
        var groups = {};
        array.forEach(function (o) {
            if (condition(o)) {
                var group = JSON.stringify(selector(o));
                groups[group] = groups[group] || [];
                o = modifier(o);
                groups[group].push(o);
            }
        });
        return Object.keys(groups).map(function (group) {
            return groups[group];
        });
    }
    splitBy(size, list) {
        return list.reduce((acc, curr, index, arr) => {
            if (!(index % size)) {
                return [...acc, arr.slice(index, index + size)];
            }
            return acc;
        }, []);
    }
    generateAnonimizedOid() {
        var promises = [];
        return this.queryAllUsers().then((result) => {
            let group = this.groupBy(result, (cond) => !cond.anonimizedOid, (mod) => {
                mod.anonimizedOid = guid_1.Guid.newGuid();
                return mod;
            }, (selector) => selector.tenantId);
            let asyncFuncs = [];
            group.forEach((tenant) => {
                let split = this.splitBy(100, tenant);
                split.forEach(list => {
                    asyncFuncs.push(() => this.batchInsertEntity(list));
                });
            });
            return asyncFuncs.reduce((prev, curr) => {
                return prev.then(curr, (reason) => console.log('Batching issue with anon:' + reason));
            }, Promise.resolve());
        }).then((result) => { });
    }
}
exports.UserTable = UserTable;
// The plan is to remove the MultiUserTable when everything has switched over.
class MultiUserTable {
    constructor(orginalTableSetting, newTableSetting, readFromNewTable = false) {
        this.originalTable = new UserTable(orginalTableSetting);
        this.newTable = new UserTable(newTableSetting);
        this.readFromNewTable = readFromNewTable;
    }
    // Get from original table
    get(userID, useNewTable = false) {
        if (this.readFromNewTable || useNewTable) {
            return this.newTable.get(userID);
        }
        else {
            return this.originalTable.get(userID);
        }
    }
    delete(model) {
        let promises = {};
        promises.push(this.originalTable.delete(model));
        promises.push(this.newTable.delete(model, model.oid));
        return Promise.all(promises).then((result) => {
            if (this.readFromNewTable) {
                return result[1];
            }
            else {
                return result[0];
            }
        });
    }
    addNewUser(userID, role, isLicensed, licenseType, anonimizedOid) {
        let orig = this.originalTable.addNewUser(userID, role, isLicensed, licenseType, anonimizedOid);
        let newt = this.newTable.addNewUser(userID, role, isLicensed, licenseType, anonimizedOid);
        return Promise.all([orig, newt]).then((result) => {
            if (this.readFromNewTable) {
                return result[1];
            }
            else {
                return result[0];
            }
        });
    }
    updateExistingUser(userID, cachedUser, role, lastRoleCheck, isLicensed, licenseType, lastLicenseCheck) {
        let orig = this.originalTable.updateExistingUser(userID, cachedUser, role, lastRoleCheck, isLicensed, licenseType, lastLicenseCheck);
        let newt = this.newTable.updateExistingUser(userID, cachedUser, role, lastRoleCheck, isLicensed, licenseType, lastLicenseCheck);
        return Promise.all([orig, newt]).then((result) => {
            if (this.readFromNewTable) {
                return result[1];
            }
            else {
                return result[0];
            }
        });
    }
    storeExperienceState(user) {
        let orig = this.originalTable.storeExperienceState(user);
        let newt = this.newTable.storeExperienceState(user);
        return Promise.all([orig, newt]).then((result) => {
            if (this.readFromNewTable) {
                return result[1];
            }
            else {
                return result[0];
            }
        });
    }
}
exports.MultiUserTable = MultiUserTable;
//# sourceMappingURL=MeeUserTable.js.map