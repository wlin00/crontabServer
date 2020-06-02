//nodeJs公示公告中间件代码
const express = require('express');
const router = express.Router();
const Info = require('../db/model/InfoModel');//导入schema对象，用于前端正确请求后，提供一个nodeJs操作数据库的对象
/**
 * @api {post} /pic/addPic
 * @apiName 添加轮播图
 * @apiGroup User
 * @apiParam {String} path 轮播图路径(required).
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/addInfo', (req, res) => {
    //添加轮播图接口，需要先上传图片获取相对路径，然后此接口保存路径
    let { img, author, time, title, content } = req.body;
    if (!img || !author || !time || !title || !content) {
        return res.send({ err: -1, msg: '参数错误！' }); //输入检测
    }
    Info.insertMany({ img, author, time, title, content })
        .then(() => {
            res.send({ err: 0, msg: '添加信息成功～' })
        })
        .catch(() => {
            res.send({ err: -2, msg: '添加信息失败！' })
        })
});
/**
 * @api {get} /info/getInfo   分页查询信息
 * @apiName getAllInfo
 * @apiGroup Info
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/getAllInfo', (req, res) => {
    //分页处理
    let { page = 1, limit = 5 } = req.body
    let count = 0; //信息总数
    Info.find()
        .then((list) => {
            count = list.length;//拿到总数据条数,对用户搜索后的数据做分页查询
            return Info.find().limit(Number(limit)).skip((Number(page) - 1) * Number(limit))
        })
        .then((data) => {
            res.send({
                err: 0, info: {
                    list: data,
                    count: count,
                }
            })
        })
        .catch((err) => {
            res.send({ err: -2, msg: err })
        })
})
/**
 * @api {get} /info/getInitialInfo   查询全部信息
 * @apiName getInitialInfo
 * @apiGroup Info
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get('/getInitialInfo', (req, res) => {
    //分页处理
    Info.find()
        .then((data) => {
            res.send({
                err: 0,
                list: data,
            })
        })
        .catch((err) => {
            res.send({ err: -2, msg: err })
        })
})
/**
 * @api {post} /info/del 删除信息
 * @apiName del
 * @apiGroup User
 *
 * @apiParam {String} _id id(required).
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/del', (req, res) => {
    let { _id } = req.body;
    if (!_id) {
        return res.send({ err: -1, msg: '参数错误！' })
    }
    Info.deleteOne({ _id })
        .then(() => {
            res.send({ err: 0, msg: '删除信息成功～' })
        })
        .catch(() => {
            res.send({ err: -2, msg: '删除信息失败！' })
        })
})
/**
 * @api {post} /info/updateInfo 编辑信息
 * @apiName update
 * @apiGroup User
 * @apiParam {String} _id 信息id(required).
 * @apiParam {String} author    作者.
 * @apiParam {String} time      上传时间.
 * @apiParam {String} title     标题(required).
 * @apiParam {Number} content   内容(required).
 * @apiParam {String} img       图片.
 * 
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/updateInfo', (req, res) => {
    let { author, _id, time, title, content, img } = req.body;
    if (!author || !_id || !title || !time || !content || !img) {
        return res.send({ err: -1, msg: '参数错误！' }); //输入检测
    }
    Info.updateOne({ _id }, { author, time, title, content, img })
        .then(() => {
            res.send({ err: 0, msg: '信息更新成功～' })
        })
        .catch(() => {
            res.send({ err: -2, msg: '信息更新失败！' })
        })
})
module.exports = router;