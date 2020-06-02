const mongoose = require('mongoose')
//获取schema对象  -- 轮播图集合
var Schema = mongoose.Schema;
//获取一个实例，映射一个mongodb中的collection
var schema1 =  new Schema({
    name:{type:String,default:''},
    path:{type:String,default:''},
    author:{type:String,default:''},
    time:{type:String,default:''},
    type:{type:Number,default:''},
       //type: 1 -- 学习资料； 2 -- 项目文件 ； 3 -- 规章制度； 4 -- 备用文件
});
//将schema转化为model，与数据库对应名字的集合相关联
var myFile = mongoose.model('myFile',schema1);
module.exports =  myFile;