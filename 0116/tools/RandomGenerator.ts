// import {UserWithoutAoid} from '../tests/MeeUserTable.spec'
import {User} from '../MeeUserTable'
import {Guid} from '../core/guid'
import {UserID} from '../AAD'

export class RandomGenerator {
    private readonly names : string[] = ['Yash', 'George', 'Divya', 'Jeff', 'Will', 'Barry', 'Ramon', 'John', 'Jasmine', 'Allison' , 'nick', 'Shroff', 'Mok', 'Smith', 'Clovin', 'Mck', 'Olson', 'Pro', 'Blake', 'Costa', 'Cooper', 'Carl', 'Ryder', 'Harmon', 'Matthews', 'Quarnstorm', 'Storm', 'Severson', 'Meeno', 'Daniel', 'Beasley', 'Brian', 'Chris', 'Jared', 'Kyle', 'Nova', 'Mark', 'Mccallister', 'Hilary', 'Albert', 'Victoria'];
    private readonly emails : string[] = ['@microsoft.com', '@gmail.com', '@live.com', '@hotmail.com', '@rocketmail.com'];
    private readonly roles : string[] = ['student', 'teacher'];

    public Integer(min : number = 1, max : number = 100) : number{
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

      
    private rand(list : string[]) {
        return list[Math.floor(Math.random() * list.length)];
    }

    public GenerateName() : string {     
        return this.rand(this.names) + ' ' + this.rand(this.names);
    }

    public GenerateEmailFromName(userName:string) : string {     
        return userName.replace(' ', '').toLowerCase() + this.Integer(0, 1000) + this.rand(this.emails);
    }

    public GenerateRandomLicenseType() : string {
        return 'license-query-licenced-000' + Math.floor((Math.random() * 10))
    }

    public GenerateRandomDate(rangeOfDays :number, hourRange : number) : Date {
        var today = new Date(Date.now());
        return new Date(today.getFullYear()+1900, today.getMonth(), today.getDate()+Math.random() *rangeOfDays, Math.random()*hourRange , Math.random()*60);
    }

    GenerateUserID(tenantId : string = undefined, unique_name: string = undefined, oid: string = undefined) : UserID {
        let user: UserID = {} as any;
        {
            user.name = this.GenerateName();
            user.tenantId = tenantId ? tenantId :  Guid.newGuid();
            user.unique_name = unique_name ? unique_name :  this.GenerateEmailFromName(user.name);
            user.osVersion = this.rand(['Microsoft Windows NT 6.2.9200.0', 'MacOS Version 10.12 (Build 16A319)', 'MacOS 10.12', 'Windows 10.0.14393.0']);
            user.clientDisplayVersion = '1.0.28';
            user.clientApplication = this.rand(['Minecraft', 'ClassroomMode']);
            user.oid = oid ? oid : Guid.newGuid();
        }

        return user;
    }

    // public GenerateUser(tenantId : string = undefined) : User {
    //     let user : User =  {} as User;
    //     user.anonimizedOid = Guid.newGuid();
    //      return Object.assign( {}, user, this.GenerateuserWithoutAoid(tenantId));
    // }

    // public GenerateuserWithoutAoid(tenantId : string = undefined) : UserWithoutAoid {
    //     let user : UserWithoutAoid = {} as any;
    //     user.name = this.GenerateName();
    //     user.unique_name = this.GenerateEmailFromName(user.name);
    //     user.isLicensed = Math.random() >= 0.5;
    //     if (user.isLicensed) {
    //         user.licenseType = this.GenerateRandomLicenseType();
    //         user.lastLicenseCheck = this.GenerateRandomDate(10, 20);
    //     }

    //     user.role = this.rand(this.roles);
    //     user.lastRoleCheck = this.GenerateRandomDate(1, 4);
    //     user.nickname = user.name.split(' ', 1)[0] + 'N';

    //     user.tenantId = tenantId || Guid.newGuid();
    //     user.oid = Guid.newGuid();

    //     user.skin = this.rand(this.names) + this.rand(this.names) + this.rand(this.names);
    //     user.trailsUsed = this.Integer(0, 20);
    //     user.trialsAllowed = this.Integer(20, 30);
    //     return user;
    // }
}