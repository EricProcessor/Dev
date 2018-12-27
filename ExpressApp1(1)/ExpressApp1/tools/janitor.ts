import * as AzureHelper from "../AzureHelper";

async function deleteUser(unique_name: string) {

    let entity = await AzureHelper.queryEntityRowKey(AzureHelper.Table.Users, unique_name);

    AzureHelper.deleteEntity(AzureHelper.Table.Users, entity);
}

async function deleteAll() {

    for (var i = 11; i <= 45; i++) {
        var name = `stu${i}@usmie.com`;
        console.log(name);

        await deleteUser(name);
    }
}

async function deleteSome(list) {
    for(var name of list) {
        console.log(name);
        await deleteUser(name);
    }
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
