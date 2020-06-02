//nodeJs文件数据中间件代码
const express = require('express');
const router = express.Router();
const myFile = require('../db/model/myFileModel');//导入schema对象，用于前端正确请求后，提供一个nodeJs操作数据库的对象
/**
 * @api {post} /myFile/addFile
 * @apiName 添加文件
 * @apiGroup User
 * @apiParam {String} path 文件路径(required).
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/addFile', (req, res) => {
    //添加轮播图接口，需要先上传图片获取相对路径，然后此接口保存路径
    let { path, name, type, author, time } = req.body;
    if (!path || !name || !type || !author || !time) {
        return res.send({ err: -1, msg: '参数错误！' }); //输入检测
    }
    myFile.insertMany({ path, name, type, author, time })
        .then(() => {
            res.send({ err: 0, msg: '添加文件成功～' })
        })
        .catch(() => {
            res.send({ err: -2, msg: '添加文件失败！' })
        })
});
/**
 * @api {get} /myFile/getAllFile   分页查询全部文件
 * @apiName getAllPic
 * @apiGroup Pic
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/getAllFile', (req, res) => {
    //分页处理
    let { page = 1, limit = 5 } = req.body;
    let count = 0;//总数据条数
    myFile.find()
        .then((list) => {
            count = list.length;//拿到总数据条数
            return myFile.find().limit(Number(limit)).skip((Number(page) - 1) * Number(limit))
        })
        .then((data) => {
            res.send({
                err: 0,
                info: {
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
 * @api {post} /myFile/getFileByKw 对文件进行关键字查询，支持模糊查询
 * @apiName 文件关键字模糊查询
 * @apiGroup User
 *
 * @apiParam {String} Kw 文件关键字(required).
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/getFileByKw', (req, res) => {
    //分页处理
    let { Kw, page = 1, limit = 5 } = req.body;
    let count = 0;//总数据条数
    if (!Kw) {
        return res.send({ err: -1, msg: '参数错误' }); //输入检测
    }
    let reg = new RegExp(Kw) //对输入的用户名关键字进行正则匹配，对name字段做模糊查询
    myFile.find(
        { name: { $regex: reg } }
    )
        .then((list) => {
            count = list.length;//拿到总数据条数,对用户搜索后的数据做分页查询
            return myFile.find({ name: { $regex: reg } }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit))
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
 * @api {post} /myFile/getFileByType 按分类分页查询文件
 * @apiName getFileByType
 * @apiGroup myFile
 * @apiParam {Number} type 文件种类ID(required).
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/getFileByType', (req, res) => {
    let { type, limit = 5, page = 1 } = req.body;
    let count = 0;//总数据条数
    if (!type) {
        return res.send({ err: -1, msg: '参数错误' }); //输入检测
    }
    myFile.find({ type })
        .then((list) => {
            count = list.length;
            return myFile.find({ type }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit))
        })
        .then((data) => {
            res.send({
                err: 0,
                info: {
                    list: data,
                    count: count,
                }
            })
        })
        .catch(() => {
            res.send({ err: -2, msg: '分类查询失败' })
        })
})
/**
 * @api {post} /myFile/del 删除文件
 * @apiName del
 * @apiGroup User
 * @apiParam {String} _id id(required).
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/del', (req, res) => {
    let { _id } = req.body;
    if (!_id) {
        return res.send({ err: -1, msg: '参数错误！' })
    }
    myFile.deleteOne({ _id })
        .then(() => {
            res.send({ err: 0, msg: '删除文件成功～' })
        })
        .catch(() => {
            res.send({ err: -2, msg: '删除文件失败！' })
        })
})
module.exports = router;