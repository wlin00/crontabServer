const mongoose = require('mongoose')
//获取schema对象
var Schema = mongoose.Schema;
//获取一个实例，映射一个mongodb中的collection
var foodSchema =  new Schema({
    name : {type:String,require:true},
    price : {type:String,require:true},
    desc : {type:String,require:true},
    typename : {type:String,require:true},   
    typeid : {type:Number,require:true},    //菜的种类：0-1-2 对应 凉菜-热菜-食堂菜
    img : {type:String,require:true}
});

//将schema转化为model，与数据库对应名字的集合相关联
var Food = mongoose.model('Food',foodSchema);

module.exports =  Food;