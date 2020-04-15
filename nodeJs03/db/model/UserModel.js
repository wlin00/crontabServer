const mongoose = require('mongoose')
//获取schema对象
var Schema = mongoose.Schema;
//获取一个实例，映射一个mongodb中的collection
var schema1 =  new Schema({
    us:String,
    ps:String,
    name:{type:String,default:''},
    sex:{type:Number,default:0},//性别0-1-2 对应未知-男-女
    mail:{type:String,default:''},
    phone:{type:Number,default:0},
    img:{type:String,default:''},
    right:{type:Number,default:0} //决定是否具备管理员权限； 0-1对应-->普通用户-管理员 


});

//将schema转化为model，与数据库对应名字的集合相关联
var User = mongoose.model('User',schema1);

module.exports =  User;