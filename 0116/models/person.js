const mongoose = require("mongoose")

let personSchema = new mongoose.Schema({ //建立schema概要，指明要存储的表的 结构字段
    acceptedEula: Boolean,
    isLicensed: Boolean,
    lastLicenseCheck: Date,
    lastRoleCheck: Date,
    name: String,
    nickname: String,
    oid: String,
    anonimizedOid: String,
    role: String,
    skin: String,
    tenantId: String,
    trialsAllowed: Number,
    trialsUsed: Number,
    unique_name: String,
    licenseType: String,
    deleted: Date,
    clientSettings: String,
    experienceState: String,
    createtimestamp: Date,
    updatetimestamp: Date,
    rowkey: String,
    partitionkey: String

})

//第一个参数是 标识model的标识符，第二个参数是 schema。  第三个参数是要连接的collection（表）的名称
module.exports = mongoose.model('Person', personSchema, "User") //通过schema概要，来生成可以操作数据库的模型。