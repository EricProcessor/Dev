import {MongodbTable, TableSetting, RetrievedEntity }from "./AzureTable";
//import {TableQuery, TableService, TableUtilities} from 'azure-storage';
import {Guid} from './core/guid';
import {UserID} from "./AAD";
import {Config} from "./Config";
// import { callbackify } from "util";
// import { logActivity,logActivityVerbose } from "./Logger";
// import { EntityConverter } from "./core/entityConverter";
// import { StorageConfig } from "./StorageConfig";

/**
 * User Schema that is used to create the table.
 * 
 * Warning: Modifying this will impact the table schema.
 */
export interface User {
    acceptedEula: boolean;
    isLicensed: boolean;
    lastLicenseCheck: Date;
    lastRoleCheck: Date;
    name: string;
    nickname: string;
    oid: string;
    anonimizedOid: string;
    role: string;
    skin: string;
    tenantId: string;
    trialsAllowed: number;
    trialsUsed: number;
    unique_name: string;
    licenseType: string;
    deleted: Date;
    clientSettings: string;
    // Json string containing whatever state is needed to be stored to determine if and when Experiences should be shown for this user
    experienceState: string;
}

export interface UserInfo {
    remainingTrialCount: number;
    user: User;
}

export interface UserGuid {
    tenantId: string;
    uniqueName: string;
    role: string;
    ipAddress: string;
    isUsed:boolean;
}

type setFunc = (User) => User;

export class UserTable extends MongodbTable<User> {
    private oidAsRowKey :boolean = false;
    private readonly defaultSkin: string = "EduSkins_Alex";
    private readonly defaultAcceptedEula = false;

    constructor(setting: TableSetting) {
        super(setting);
    }

    private startingTrialCountTeacher = 25;
    private startingTrialCountStudent = 10;


    private set(userID: UserID, func: setFunc) {
        return this.get(userID).then((entity) => {
            if (entity.exists) {
                let userToUpdate: User = {} as any;
                userToUpdate.tenantId = userID.tenantId;
                userToUpdate.oid = userID.oid;
                userToUpdate.unique_name = userID.unique_name;
                userToUpdate = func(userToUpdate);
                return this.insertOrMerge(userToUpdate);
            }else {
                // Write a log
                throw new Error(`set: Unable to update skin, user does not exist. tenantId: '${userID.tenantId}', oid: '${userID.oid}'.`);
            }
        },
            (reason) => { throw new Error(`set Failed: ${reason}`) });
    }

    public setTrialCounts(userID: UserID, trialsAllowed: number, trialsUsed: number) {
        return this.set(userID, (user: User) => {
            user.trialsAllowed = trialsAllowed;
            user.trialsUsed = trialsUsed;
            return user;
        });
    }

    public setSkin(userID: UserID, skin: string) {
        return this.set(userID, (user: User) => {
            user.skin = skin;
            return user;
        });
    }

    public updateEula(userID: UserID, acceptedEula: boolean = true){
        return this.set(userID, (user: User) => {
            user.acceptedEula = acceptedEula;
            return user;
        });
    }

    public querybyUniqueName(unique_name: string){
        // let stringFilter = TableQuery.stringFilter('unique_name', TableUtilities.QueryComparisons.EQUAL, unique_name);
        // let query = (new TableQuery()).where(stringFilter);
        // return this.findOne("Users",{'unique_name':unique_name});
        return this.queryEntities({'unique_name':unique_name});
    }
 
    public queryAllUsers() : Promise<User[]> {
        //let query = new TableQuery();
        return this.queryEntities({});
    }

    public get(userID: UserID) : Promise<RetrievedEntity<User>> {
        let user : User = {} as any;
        user.tenantId = userID.tenantId;
        user.oid = userID.oid;
        user.unique_name = userID.unique_name;
        console.log("RetrievedEntity"+JSON.stringify(user) )
        return this.retrieve(user);
        //return this.retrieveQuery(user);
    }

    public addNewUser(userID: UserID, role: string, isLicensed: boolean, licenseType: string, anonimizedOid: string) : Promise<UserInfo> {
        let date = new Date();
        return this.updateExistingUser(userID, {} as any, role, date, isLicensed, licenseType, date, anonimizedOid);
    }

    // Design: I tried to use InsertAndMerge here, but it seems like we need to return the user object. Might be better to just construct the final object and call replace.
    //  Or merge the object together when we return.
    public updateExistingUser(userID: UserID, cachedUser: User, role:string, lastRoleCheck: Date, isLicensed: boolean, licenseType: string, lastLicenseCheck: Date, anonimizedOid : string = undefined) : Promise<UserInfo> {
        // sign in user, but don't bother with checking or decrementing trial counts if user is licensed
        let remainingTrialCount = 0;

        let userToUpdate : User = {} as any;
        {
            // Due to multi user scenarios we will update everything.
            userToUpdate.tenantId = cachedUser.tenantId || userID.tenantId;
            userToUpdate.unique_name = cachedUser.unique_name || userID.unique_name;
            userToUpdate.lastRoleCheck = lastRoleCheck;
            userToUpdate.lastLicenseCheck = lastLicenseCheck;
            userToUpdate.role = role;
            userToUpdate.name = userID.name;
            userToUpdate.oid = userID.oid;
            userToUpdate.anonimizedOid = cachedUser.anonimizedOid || anonimizedOid || Guid.newGuid();
            userToUpdate.skin = cachedUser.skin || this.defaultSkin;
            userToUpdate.nickname = this.GetUserNickname(userID.name, userID.userName);

            // It is possible that the user came in through the classroom mode signin, in which case we don't currently do a license check.
            userToUpdate.isLicensed = isLicensed;
            userToUpdate.licenseType = licenseType;
            console.log(role);
            if (role === "teacher") {
                userToUpdate.acceptedEula = cachedUser.acceptedEula || this.defaultAcceptedEula;
            }

            // Handle new trials. 
            if (role !== cachedUser.role) {
                userToUpdate.trialsAllowed = (role === "teacher" ? Config.startingTrialCountTeacher : Config.startingTrialCountStudent);
            }
        }
        
        // If user is not licenced setup trials
        if (!isLicensed) {
            let numTrialsAllowed: number;
            if (cachedUser.trialsAllowed) {
                numTrialsAllowed = cachedUser.trialsAllowed;
            }
            else {
                numTrialsAllowed = (role === "teacher" ? Config.startingTrialCountTeacher : Config.startingTrialCountStudent);
                userToUpdate.trialsAllowed = numTrialsAllowed;
            }

            let numTrialsUsed: number;
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
        console.log("userToUpdate000"+JSON.stringify(userToUpdate));
        return this.insertOrMerge(userToUpdate).then( () => {
            let userInfo = {} as any;
            {
                userInfo.remainingTrialCount = remainingTrialCount;

                // Merge both objects.
                userInfo.user = Object.assign({}, cachedUser, userToUpdate);
            }
            console.log("userInfo-----------qqq"+JSON.stringify(userInfo))
            return userInfo;
        });
    }

    public storeExperienceState(user: User) : Promise<User> {
        // Replace so that experience state can be reduced
        return this.insertOrReplace(user).then(() => {
            return user
        });
    }

    public GetUserNickname(name:string, userName: string) {

        let minecraftName = this.getMinecraftName(name, userName);
    
        let nameParts = minecraftName.split(' ');
        let playerName: string = nameParts[0];
        if (nameParts.length > 1 && nameParts[1].length > 0) {
            playerName += nameParts[1][0];
        }
    
        return playerName.substring(0, 16);
    }

    // Return the user's name based on their "human name", if it contains ASCII characters,
    // otherwise use the player's "userName" (which is either upn or email) and guaranteed to be
    // made up of ASCII characters.
    private getMinecraftName(name:string, userName: string): string {
        const re = /^[_ ]+$/;
        const encodedName = this.encodeName(name);
    
        if (encodedName.match(re)) {
            return this.encodeName(userName);
        } else {
            return encodedName;
        }
    }
    
    private encodeName(name: string): string {
        const legalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_ ";
        let encodedName = "";
    
        for (let i = 0; i < name.length; ++i) {
            if (legalChars.indexOf(name[i]) >= 0) {
                encodedName += name[i];
            } else {
                encodedName += name[i] === '@' ? " " : "_";
            }
        }
    
        return encodedName;
    }

    private groupBy<T>( array ,condition, modifier, selector)
    {
        var groups = {};
        array.forEach( function( o )
        {
            if (condition(o)) {
                var group = JSON.stringify( selector(o) );
                groups[group] = groups[group] || [];
                o = modifier(o);
                groups[group].push(o);  
            }
        });

        return Object.keys(groups).map( function( group )
        {
            return groups[group]; 
        })
    }

    private splitBy(size:number, list : any[]) {
        return list.reduce((acc, curr, index, arr) => {
            if (!(index % size)) {
                return [...acc, arr.slice(index, index + size)];
            }

            return acc;
        }, []);
    }

    public generateAnonimizedOid() : Promise<void> {
        var promises: Promise<void>[] = [];
        return this.queryAllUsers().then((result) => {
                let group = this.groupBy(
                    result,
                    (cond: User) => !cond.anonimizedOid, 
                    (mod: User) => {
                        mod.anonimizedOid = Guid.newGuid();
                        return mod;
                    },
                    (selector) => selector.tenantId);
                
                let asyncFuncs = [];

                group.forEach((tenant : User[]) => {
                    let split = this.splitBy(100, tenant);
                    split.forEach(list => {
                        asyncFuncs.push(() => this.batchInsertEntity(list));
                    });
                });
                
                return asyncFuncs.reduce((prev, curr) => {
                    return prev.then(curr, (reason) => console.log('Batching issue with anon:' + reason));
                }, Promise.resolve());
            }).then((result) => {});
    }
}

// The plan is to remove the MultiUserTable when everything has switched over.
export class MultiUserTable {
    private originalTable: UserTable;
    private newTable: UserTable;
    private readFromNewTable: boolean;

    constructor(orginalTableSetting: TableSetting, newTableSetting: TableSetting, readFromNewTable: boolean = false) {
        this.originalTable = new UserTable(orginalTableSetting);
        this.newTable = new UserTable(newTableSetting);
        this.readFromNewTable = readFromNewTable;
    }

    // Get from original table
    public get(userID: UserID, useNewTable: boolean = false) : Promise<RetrievedEntity<User>> {
        if (this.readFromNewTable || useNewTable) {
            console.log("newTable");
            return this.newTable.get(userID);
        }
        else {
            console.log("originalTable");
            return this.originalTable.get(userID);
        }
    }

    public delete(model: User) : Promise<void>{
        let promises : Promise<void>[] = {} as any;
        promises.push(this.originalTable.delete(model));
        promises.push(this.newTable.delete(model, model.oid));
        return Promise.all(promises).then(
            (result) => {
                if (this.readFromNewTable) {
                    return result[1];
                }
                else {
                    return result[0];
                }
            }
        );
    }

    public addNewUser(userID: UserID, role: string, isLicensed: boolean, licenseType: string, anonimizedOid: string) : Promise<UserInfo> {
        let orig = this.originalTable.addNewUser(userID, role, isLicensed, licenseType, anonimizedOid);
        let newt = this.newTable.addNewUser(userID, role, isLicensed, licenseType, anonimizedOid);

        return Promise.all([orig, newt]).then(
            (result) => {
                if (this.readFromNewTable) {
                    return result[1];
                }
                else {
                    return result[0];
                }
            }
        );
    }

    public updateExistingUser(userID: UserID, cachedUser: User, role:string, lastRoleCheck: Date, isLicensed: boolean, licenseType: string, lastLicenseCheck: Date) : Promise<UserInfo> {
        console.log("updateExistingUser1111");
        let orig = this.originalTable.updateExistingUser(userID, cachedUser, role, lastRoleCheck, isLicensed, licenseType, lastLicenseCheck);
        console.log("updateExistingUser2222");
        let newt = this.newTable.updateExistingUser(userID, cachedUser, role, lastRoleCheck, isLicensed, licenseType, lastLicenseCheck);
        console.log("updateExistingUser3333");
        return Promise.all([orig, newt]).then(
            (result) => {
                if (this.readFromNewTable) {
                    return result[1];
                }
                else {
                    return result[0];
                }
            }
        );
    }

    public storeExperienceState(user: User) : Promise<User> {
        let orig = this.originalTable.storeExperienceState(user);
        let newt = this.newTable.storeExperienceState(user);

        return Promise.all([orig, newt]).then(
            (result) => {
                if (this.readFromNewTable) {
                    return result[1];
                }
                else {
                    return result[0];
                }
            }
        );
    }
}