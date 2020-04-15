const express = require('express');
const router = express.Router();
const Food = require('../db/model/FoodModel');//导入食物schema对象，对数据库进行操作有:增、删、改、分类查询、关键字查询、分页查询



/**
 * @api {post} /food/add 新增菜品
 * @apiName addFood
 * @apiGroup Food
 *
 * @apiParam {String} name 菜品名(required).
 * @apiParam {String} price 价格(required).
 * @apiParam {String} desc 描述(required).
 * @apiParam {String} typename 菜品种类(required).
 * @apiParam {Number} typeid 菜品种类ID(required).
 * @apiParam {String} img 图片(required).
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
 router.post('/add',(req,res)=>{
    let {name,price,desc,typename,typeid,img} = req.body;
    if(!name || !price|| !desc|| !typename|| !typeid|| !img){
        return res.send({err:-1,msg:'参数错误'}); //输入检测
    } 
    // let data ={ 
    //     name: '火山飘雪',
    //     price: '9999',
    //     desc: '超好吃',
    //     typename: '凉菜',
    //     typeid: 1,
    //     img: '/public/img/img4.png'
    // }
    Food.insertMany({name,price,desc,typename,typeid,img})
    .then(()=>{
        res.send({err:0,msg:'增添成功'})
    })
    .catch(()=>{
        res.send({err:-2,msg:'增添失败'})
    })     
 })


/**
 * @api {post} /food/getInfoByType 分类查询
 * @apiName getInfoByType
 * @apiGroup Food
 *
 * @apiParam {Number} typeid 菜品种类ID(required).
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
 router.post('/getInfoByType',(req,res)=>{

    let {typeid} = req.body;
    if(!typeid) {
        return res.send({err:-1,msg:'参数错误'}); //输入检测
    }
    Food.find({typeid})
    .then((data)=>{
        res.send({err:0,list:data,a:req.cookies})
    })
    .catch(()=>{
        res.send({err:-2,msg:'分类查询失败'})
    })
 })


/**
 * @api {post} /food/getInfoByType 关键字查询
 * @apiName getInfoByKw
 * @apiGroup Food
 *
 * @apiParam {String} Kw 关键字(required).
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/getInfoByKw',(req,res)=>{
    //node内置模块： 1、$gte:判断数值是否大于某值； 2、$or：并集操作如:$or:[{...}, {...}]； 3、$regex 判断正则匹配: schema.find({name:{$regex:reg}})
    let {Kw} = req.body;
    if(!Kw){
        return res.send({err:-1,msg:'参数错误'})
    }
    let reg = new RegExp(Kw);//对输入关键字做正则匹配，对name、desc字段做关键字查询

    Food.find(
        {name:{$regex:reg}}
    )
    .then((data)=>{
        // req.session.login=true
        res.send({err:0,list:data})
    })
    .catch((err)=>{
        res.send({err:-2,msg:'关键字查询失败'+err})
    })
})

router.post('/getInfoById',(req,res)=>{
    //node内置模块： 1、$gte:判断数值是否大于某值； 2、$or：并集操作如:$or:[{...}, {...}]； 3、$regex 判断正则匹配: schema.find({name:{$regex:reg}})
    let {Id} = req.body;
    if(!Id){
        return res.send({err:-1,msg:'参数错误'})
    }
    let reg = new RegExp(Id);//对输入关键字做正则匹配，对name、desc字段做关键字查询

    Food.find(
        {_id:Id}
    )
    .then((data)=>{
        res.send({err:0,list:data})
    })
    .catch((err)=>{
        res.send({err:-2,msg:'id查询失败'+err})
    })
})

 /**
 * @api {post} /food/del 删除
 * @apiName del
 * @apiGroup Food
 *
 * @apiParam {String} _id id(required).
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/del',(req,res)=>{
    let {_id} = req.body;
    if(!_id){
        return res.send({err:-1,msg:'参数错误'})
    }

    Food.deleteOne({_id})
    .then(()=>{
        res.send({err:0,msg:'删除成功'})
    })
    .catch(()=>{
        res.send({err:-2,msg:'删除失败'})
    })
})


/**
 * @api {post} /food/update 更改菜品
 * @apiName update
 * @apiGroup Food
 *
 * @apiParam {String} _id 菜品主键id(required).
 * 
 * @apiParam {String} name 菜品名(required).
 * @apiParam {String} price 价格(required).
 * @apiParam {String} desc 描述(required).
 * @apiParam {String} typename 菜品种类(required).
 * @apiParam {Number} typeid 菜品种类ID(required).
 * @apiParam {String} img 图片(required).
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/update',(req,res)=>{
    let {name,price,desc,typename,typeid,img,_id} = req.body;
    if(!name || !price|| !desc|| !typename|| !typeid|| !img || !_id){
        return res.send({err:-1,msg:'参数错误'}); //输入检测
    } 
    // let data ={ 
    //     name: '火山飘雪',
    //     price: '9999',
    //     desc: '超好吃',
    //     typename: '凉菜',
    //     typeid: 1,
    //     img: '/public/img/img4.png'
    // }
    Food.updateOne({_id},{name,price,desc,typename,typeid,img})
    .then(()=>{
        res.send({err:0,msg:'更改成功'})
    })
    .catch(()=>{
        res.send({err:-2,msg:'更改失败'})
    })     
 })


 /**
 * @api {post} /food/getInfoByPage 分页查询
 * @apiName getInfoByPage
 * @apiGroup Food
 *
 * @apiParam {String} pageSize 分页大小(required).
 * @apiParam {String} pageNum 页码(required).
 * 
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/getInfoByPage',(req,res)=>{
    //借助于schema对象的limit（取数据条数）和skip（跳过多少数据）方法 , skip的算法公式为： (对应页码序号-1) * 分页大小
    let pageSize = req.body.pageSize || 3;  //分页大小默认值为3
    let pageNum = req.body.pageNum || 1;    //页码默认值为1
    let count  = 0;//总数据条数
    Food.find()
     .then((list)=>{
        count=list.length;
        return Food.find().limit(Number(pageSize)).skip((Number(pageNum)-1)*Number(pageSize))
    })
    .then((data)=>{
        let allpage = Math.ceil(parseInt(count)/parseInt(pageSize)) //获得最大页码数
        res.send({err:0,info:{
          list:data,
          count:count, 
          allpage:allpage,
        }})
    })
    .catch(()=>{
        res.send({err:-2,msg:'分页查询失败'})
    })   

})
 

module.exports = router;