const mongoose = require('mongoose')
//获取schema对象  -- 轮播图集合
var Schema = mongoose.Schema;
//获取一个实例，映射一个mongodb中的collection
var schema1 =  new Schema({
    img:{type:String,default:''},
});
//将schema转化为model，与数据库对应名字的集合相关联
var Pic = mongoose.model('Pic',schema1);
module.exports =  Pic;