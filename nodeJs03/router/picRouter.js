const express = require('express');
const router = express.Router();
const Pic = require('../db/model/PicModel');//导入schema对象，用于前端正确请求后，提供一个nodeJs操作数据库的对象


/**
 * @api {post} /pic/addPic
 * @apiName 添加轮播图
 * @apiGroup User
 *
 * @apiParam {String} path 轮播图路径(required).
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */

router.post('/addPic', (req, res) => {
    //添加轮播图接口，需要先上传图片获取相对路径，然后此接口保存路径

    let { path } = req.body;
    if (!path) {
        return res.send({ err: -1, msg: '参数错误！' }); //输入检测
    }

    Pic.insertMany({img:path})
    .then(()=>{
        res.send({err:0,msg:'添加轮播图成功～'})
    })
    .catch(()=>{
        res.send({err:-2,msg:'添加轮播图失败！'})
    }) 
});

/**
 * @api {get} /pic/getPic   查询全部轮播图
 * @apiName getAllPic
 * @apiGroup Pic
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */


router.get('/getAllPic', (req, res) => {
    //分页处理

    Pic.find()
        .then((data) => {
            res.send({
                err: 0,
                list: data,

                //  info: {
                    // list: data,
                // }
            })
        })
        .catch((err) => {
            res.send({ err: -2, msg: err })
        })
})





/**
 * @api {post} /pic/del 删除轮播图
 * @apiName del
 * @apiGroup User
 *
 * @apiParam {String} _id id(required).
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/del',(req,res)=>{
    let {_id} = req.body;
    if(!_id){
        return res.send({err:-1,msg:'参数错误！'})
    }

    Pic.deleteOne({_id})
    .then(()=>{
        res.send({err:0,msg:'删除轮播图成功～'})
    })
    .catch(()=>{
        res.send({err:-2,msg:'删除轮播图失败！'})
    })
})



module.exports = router;