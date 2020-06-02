//nodeJs用户中间件代码
const express = require('express');
const router = express.Router();
const Mail = require('../utils/mail');//引入邮箱模块
const codes = {};//将验证码保存在内存中
let user = {};
const User = require('../db/model/UserModel');//导入schema对象，用于前端正确请求后，提供一个nodeJs操作数据库的对象
const request = require('request')
const cookieParser = require('cookie-parser')
const session = require('express-session')
//  调用外部接口请求的函数，用于获取权限对应的hash值
function httprequest(url, data) {
    return new Promise((resolve, reject) => {
        request({
            url: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // node服务器请求外部API成功，函数返回获取后的hash值
                res = body.data.authHash
                resolve(res)
            }
            else {
                reject('acc error!')
            }
        });
    })
};
/**
 * @api {post} /user/reg 用户添加 --- 添加用户
 * @apiName 用户注册
 * @apiGroup User
 *
 * @apiParam {String} id 用户名(required).
 * @apiParam {String} ps 用户密码(required).
 * @apiParam {String} code 邮箱验证码(required).
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/reg', (req, res) => {
    //注册接口，获取数据-->数据处理-->
    //添加用户api
    let { us, ps, name, sex, mail, phone } = req.body;
    if (!us || !ps || !name || !sex || !mail || !phone) {
        return res.send({ err: -1, msg: '参数错误' }); //输入检测
    }
    User.find({ us })
        .then((data) => {
            if (data.length === 0) {
                //首先进行数据库查找，如果数据库不存在同名用户，才允许注册,从而在这里return一个new promise，来走then中的代码
                return User.insertMany({ us, ps, name, sex, mail, phone })
            } else {
                return res.send({ err: -2, msg: '该用户已存在！' });
            }
        })
        .then(() => { res.send({ err: 0, msg: '添加用户成功~' }) })
        .catch((err) => { res.send({ err: -3, msg: '请求失败，请重试！' }) })
});
//登出
router.post('/logOut', (req, res) => {
    user[req.session.name] = undefined
    req.session.destroy();
    //清除请求头session，并且session键值对删除当前用户的键    
    res.send({ err: 0, msg: 'quit' })
})
/**
 * @api {post} /user/login 用户登陆
 * @apiName login
 * @apiGroup User
 *
 * @apiParam {String} us 用户名(required).
 * @apiParam {String} ps 用户密码(required).
 *
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/login', (req, res) => {
    //登陆接口，获取数据-->数据处理（数据库中存在）-->返回数据
    let { us, ps } = req.body;
    if (!us || !ps) {
        return res.send({ err: -1, msg: '参数错误' });
    }
    User.find({ us: us, ps: ps })
        .then((data) => {
            if (data.length > 0) {
                if (user[us] === undefined) {
                 
                    //打印当前登陆用户和权限字段，并用这个字段作为参数请求外部接口，返回前端转化后的hash。
                    let postData = { authRole: String(data[0].right) }
                    httprequest('http://118.24.218.213:8000/acc/authhash', postData).then((hash) => {
                        console.log('func_d', hash)

                        //登陆成功后的操作 - 存储sessionId在内存map中，设置请求头session标识符
                        user[us] = true
                        //登陆成功，用户信息记录在session里     
                        req.session.login = true;
                        req.session.name = us;
                        console.log(user)
                        return res.send({ err: 0, msg: req.session, data: data, hash });
                    }, (err) => {
                        return res.send({ err: -500, msg: err });
                    })
                } else {
                    console.log(user[us])
                    return res.send({ err: -5, msg: '该用户已登陆' });
                }
            }
            else {
                return res.send({ err: -3, msg: '用户名或密码不正确' });
            }
        })
        .catch(() => { res.send({ err: -2, msg: '内部错误' }) });
});
/**
 * @api {post} /user/loginBack 管理员登陆
 * @apiName loginBack
 * @apiGroup User
 *
 * @apiParam {String} us 用户名(required).
 * @apiParam {String} ps 用户密码(required).
 *
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/loginBack', (req, res) => {
    //登陆接口，获取数据-->数据处理（数据库中存在）-->返回数据
    let { us, ps } = req.body;
    if (!us || !ps) {
        return res.send({ err: -1, msg: '参数错误' });
    }
    User.find({ us: us, ps: ps })
        .then((data) => {
            if (data.length > 0) {
                //非管理员权限拦截
                if (data[0].right !== 1) {
                    return res.send({ err: -6, msg: '该用户不是管理员！' })
                }
                if (user[us] === undefined) {
                    //登陆成功后的操作 - 存储sessionId在内存map中，设置请求头session标识符
                    user[us] = true
                    //登陆成功，用户信息记录在session里     
                    req.session.login = true;
                    req.session.name = us;
                    //打印当前登陆用户和权限字段，并用这个字段作为参数请求外部接口，返回前端转化后的hash。
                    console.log(user)
                    let postData = { authRole: String(data[0].right) }
                    httprequest('http://118.24.218.213:8000/acc/authhash', postData).then((hash) => {
                        console.log('func_d', hash)
                        return res.send({ err: 0, msg: req.session, data: data, hash });
                    }, (err) => {
                        return res.send({ err: -500, msg: err });
                    })
                } else {
                    return res.send({ err: -5, msg: '该用户已登陆' });
                }
            }
            else {
                return res.send({ err: -3, msg: '用户名或密码不正确' });
            }
        })
        .catch(() => { res.send({ err: -2, msg: '内部错误' }) });
});
/**
 * @api {post} /user/getMailCode 用户邮箱验证
 * @apiName 用户邮箱验证
 * @apiGroup User
 *
 * @apiParam {String} mail 用户邮箱(required).
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/getMailCode', (req, res) => {
    let { mail } = req.body;
    let code = parseInt(1000 + Math.floor(Math.random() * 8999));
    //封装发送邮箱验证接口,在mailJs中暴露出一个返回Promise对象的方法
    Mail.send(mail, code).then(() => {
        codes[mail] = code;//验证码保存到全局对象中
        res.send({ err: 0, msg: '验证码发送成功', code: code })
    })
        .catch((err) => { res.send({ err: -1, msg: err + ' send err' }) })
});
/**
 * @api {post} /user/getMailCode 获取邮箱验证码
 * @apiName 获取邮箱验证码
 * @apiGroup User
 *
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/getPhoneCode', (req, res) => {
    //node request模块安装命令：npm install request
    var querystring = require('querystring');
    var queryData = querystring.stringify({
        "mobile": req.body.mobile,  // 接受短信的用户手机号码
        "tpl_id": req.body.tpl_id,  // 您申请的短信模板ID，根据实际情况修改
        "tpl_value": "#code#=1235231",  // 您设置的模板变量，根据实际情况修改
        "key": req.body.key,  // 应用APPKEY(应用详细页查询)
    });
    var queryUrl = 'http://v.juhe.cn/sms/send?' + queryData;
    request(queryUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body) // 打印接口返回内容
            var jsonObj = JSON.parse(body); // 解析接口返回的JSON内容
            console.log(jsonObj)
        } else {
            console.log('请求异常');
        }
    })
});
/**
 * @api {post} /user/getUserByRight 用户id查询
 * @apiName 用户id查询
 * @apiGroup User
 *
 * @apiParam {String} Id 用户id(required).
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/getUserById', (req, res) => {
    //node内置模块： 1、$gte:判断数值是否大于某值； 2、$or：并集操作如:$or:[{...}, {...}]； 3、$regex 判断正则匹配: schema.find({name:{$regex:reg}})
    let { Id } = req.body;
    if (!Id) {
        return res.send({ err: -1, msg: '参数错误' })
    }
    // let reg = new RegExp(Id);//对输入关键字做正则匹配，对name、desc字段做关键字查询
    User.find(
        { _id: Id }
    )
        .then((data) => {
            res.send({ err: 0, list: data })
        })
        .catch((err) => {
            res.send({ err: -2, msg: 'id查询失败' + err })
        })
})
/**
 * @api {post} /user/getUserByRight 按权限分类查询
 * @apiName 用户权限分类查询
 * @apiGroup User
 *
 * @apiParam {Number} right 用户权限标识(required).
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/getUserByRight', (req, res) => {
    //分页处理
    let { right, page = 1, limit = 5 } = req.body;
    let count = 0;//总数据条数
    if (!/^[0123]{1}$/.test(right)) {
        return res.send({ err: -1, msg: '参数错误' }); //输入检测
    }
    User.find({ right }) //根据权限分页查询
        .then((list) => {
            count = list.length;//拿到总数据条数
            return User.find({ right }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit))
        })
        .then((data) => {
            let allPage = Math.ceil(parseInt(count) / parseInt(limit))
            res.send({
                err: 0, info: {
                    list: data,
                    count: count,
                    allPage: allPage
                }
            })
        })
        .catch((err) => {
            res.send({ err: -2, msg: err })
        })
})
/**
 * @api {post} /user/getUserByRight 用户id查询
 * @apiName 用户id查询
 * @apiGroup User
 *
 * @apiParam {String} Id 用户id(required).
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/getUserById', (req, res) => {
    //node内置模块： 1、$gte:判断数值是否大于某值； 2、$or：并集操作如:$or:[{...}, {...}]； 3、$regex 判断正则匹配: schema.find({name:{$regex:reg}})
    let { Id } = req.body;
    if (!Id) {
        return res.send({ err: -1, msg: '参数错误' })
    }
    // let reg = new RegExp(Id);//对输入关键字做正则匹配，对name、desc字段做关键字查询
    User.find(
        { _id: Id }
    )
        .then((data) => {
            res.send({ err: 0, list: data })
        })
        .catch((err) => {
            res.send({ err: -2, msg: 'id查询失败' + err })
        })
})
/**
 * @api {post} /user/getUserByKw 对用户进行关键字查询，支持模糊查询
 * @apiName 用户关键字模糊查询
 * @apiGroup User
 *
 * @apiParam {String} Kw 用户关键字(required).
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/getUserByKw', (req, res) => {
    //分页处理
    let { Kw, page = 1, limit = 5 } = req.body;
    let count = 0;//总数据条数
    if (!Kw) {
        return res.send({ err: -1, msg: '参数错误' }); //输入检测
    }
    let reg = new RegExp(Kw) //对输入的用户名关键字进行正则匹配，对name字段做模糊查询
    User.find(
        { name: { $regex: reg } }
    )
        .then((list) => {
            count = list.length;//拿到总数据条数,对用户搜索后的数据做分页查询
            return User.find({ name: { $regex: reg } }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit))
        })
        .then((data) => {
            let allPage = Math.ceil(parseInt(count) / parseInt(limit))
            res.send({
                err: 0, info: {
                    list: data,
                    count: count,
                    allPage: allPage
                }
            })
        })
        .catch((err) => {
            res.send({ err: -2, msg: err })
        })
})
/**
 * @api {post} /user/getAllUser 对全部用户进行分页查询
 * @apiName 全部用户分页查询
 * @apiGroup User
 *
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/getAllUser', (req, res) => { //获取全部用户接口，分页查询
    //分页处理
    let { page = 1, limit = 5 } = req.body;
    let count = 0;//总数据条数
    User.find()
        .then((list) => {
            count = list.length;//拿到总数据条数,对用户搜索后的数据做分页查询
            return User.find().limit(Number(limit)).skip((Number(page) - 1) * Number(limit))
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
 * @api {post} /user/getAllUser 对全部用户进行查询
 * @apiName 全部用户查询
 * @apiGroup User
 *
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get('/getInitialUser', (req, res) => {
    //分页处理
    User.find()
        .then((data) => {
            res.send({
                err: 0, info: {
                    list: data,
                }
            })
        })
        .catch((err) => {
            res.send({ err: -2, msg: err })
        })
})
/**
 * @api {post} /user/updateUser 编辑用户
 * @apiName update
 * @apiGroup User
 *
 * @apiParam {String} _id 用户id(required).
 * 
 * @apiParam {String} us    账号.
 * @apiParam {String} ps    密码.
 * @apiParam {String} name  姓名(required).
 * @apiParam {Number} sex   性别(required).
 * @apiParam {String} mail  邮箱(required).
 * @apiParam {Number} phone 联系方式(required).
 * @apiParam {String} img   头像.
 * @apiParam {Number} right 权限.
 * 
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/updateUser', (req, res) => {
    let { name, _id, sex, mail, phone } = req.body;
    if (!name || !_id || !sex || !mail || !phone) {
        return res.send({ err: -1, msg: '参数错误' }); //输入检测
    }
    User.updateOne({ _id }, { name, sex, mail, phone })
        .then(() => {
            res.send({ err: 0, msg: '更改成功' })
        })
        .catch(() => {
            res.send({ err: -2, msg: '更改失败' })
        })
})
/**
 * @api {post} /user/updateRight 用户权限提升至管理员
 * @apiName updateRight
 * @apiGroup User
 *
 * @apiParam {String} _id 用户id(required).
 * 
 * 
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/updateRight', (req, res) => {
    let { _id } = req.body;
    if (!_id) {
        return res.send({ err: -1, msg: '参数错误' }); //输入检测
    }
    User.find({ _id })
        .then((data) => {
            if (data.length > 0) {
                if (data[0].right !== 1) {
                    return User.updateOne({ _id }, { right: 1 })
                } else {
                    return Promise.reject('该用户已经是管理员')
                }
            }
            else {
                return res.send({ err: -3, msg: '该用户不存在' });
            }
        })
        .then(() => {
            return res.send({ err: 0, msg: '权限更改成功' })
        })
        .catch((err) => { res.send({ err: -2, msg: err }) });
})
/**
 * @api {post} /user/updateRight 用户权限提升至发布者 -- 节点发布
 * @apiName updateRight2
 * @apiGroup User
 *
 * @apiParam {String} _id 用户id(required).
 * 
 * 
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/updateRight2', (req, res) => {
    let { _id } = req.body;
    if (!_id) {
        return res.send({ err: -1, msg: '参数错误！' }); //输入检测
    }
    User.find({ _id })
        .then((data) => {
            if (data.length > 0) {
                if (data[0].right !== 2) {
                    return User.updateOne({ _id }, { right: 2 })
                } else {
                    return Promise.reject('该用户已具备发布权限！')
                }
            }
            else {
                return res.send({ err: -3, msg: '该用户不存在！' });
            }
        })
        .then(() => {
            return res.send({ err: 0, msg: '权限更改成功～' })
        })
        .catch((err) => { res.send({ err: -2, msg: err }) });
})
/**
 * @api {post} /user/updateRight 用户权限提升至监控者 -- 节点监控
 * @apiName updateRight3
 * @apiGroup User
 *
 * @apiParam {String} _id 用户id(required).
 * 
 * 
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/updateRight3', (req, res) => {
    let { _id } = req.body;
    if (!_id) {
        return res.send({ err: -1, msg: '参数错误' }); //输入检测
    }
    User.find({ _id })
        .then((data) => {
            if (data.length > 0) {
                if (data[0].right !== 3) {
                    return User.updateOne({ _id }, { right: 3 })
                } else {
                    return Promise.reject('该用户已具备监控权限！')
                }
            }
            else {
                return res.send({ err: -3, msg: '该用户不存在！' });
            }
        })
        .then(() => {
            return res.send({ err: 0, msg: '权限更改成功～' })
        })
        .catch((err) => { res.send({ err: -2, msg: err }) });
})
/**
 * @api {post} /user/reduceRight 用户权限降低至普通
 * @apiName updateRight
 * @apiGroup User
 *
 * @apiParam {String} _id 用户id(required).
 * 
 * 
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/reduceRight', (req, res) => {
    let { _id } = req.body;
    if (!_id) {
        return res.send({ err: -1, msg: '参数错误！' }); //输入检测
    }
    User.find({ _id })
        .then((data) => {
            if (data.length > 0) {
                if (data[0].right !== 0) {
                    return User.updateOne({ _id }, { right: 0 })
                } else {
                    return Promise.reject('该成员不是特权用户！')
                }
            }
            else {
                return res.send({ err: -3, msg: '该成员不存在！' });
            }
        })
        .then(() => {
            return res.send({ err: 0, msg: '权限更改成功！' })
        })
        .catch((err) => { res.send({ err: -2, msg: err }) });
})
/**
 * @api {post} /user/updateImg 编辑头像
 * @apiName update
 * @apiGroup User
 *
 * @apiParam {String} _id 用户id(required).
 * 
 * @apiParam {String} img   头像的相对路径.
 * 
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/updateImg', (req, res) => {
    let { img, _id } = req.body;
    if (!img || !_id) {
        return res.send({ err: -1, msg: '参数错误' }); //输入检测
    }
    User.updateOne({ _id }, { img })
        .then(() => {
            res.send({ err: 0, msg: '更改成功' })
        })
        .catch(() => {
            res.send({ err: -2, msg: '更改失败' })
        })
})
/**
 * @api {post} /user/updatePwd 修改密码接口
 * @apiName update
 * @apiGroup User
 *
 * //接收参数区域
 * @apiParam {String} _id 用户id(required).
 * @apiParam {String} ps   原密码.
 * @apiParam {String} newPs1   新密码.
 * @apiParam {String} newPs2   确认密码.
 * 
 * 
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/updatePwd', (req, res) => {
    let { ps, newPs1, newPs2, _id } = req.body;
    if (!ps || !newPs1 || !newPs2 || !_id) {
        return res.send({ err: -1, msg: '参数错误' }); //输入检测
    }
    User.find({ _id })
        .then((data) => {
            if (data.length > 0) {
                console.log('data=', data)
                if (data[0].ps === ps.toString()) {
                    return User.updateOne({ _id }, { ps: newPs1 })
                } else {
                    return Promise.reject('原密码错误')
                }
            }
            else {
                return res.send({ err: -3, msg: '该用户不存在' });
            }
        })
        .then(() => {
            return res.send({ err: 0, msg: '密码更改成功' })
        })
        .catch((err) => { res.send({ err: -2, msg: err }) });
})
/**
 * @api {post} /user/del 删除
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
        return res.send({ err: -1, msg: '参数错误' })
    }
    User.deleteOne({ _id })
        .then(() => {
            res.send({ err: 0, msg: '删除用户成功' })
        })
        .catch(() => {
            res.send({ err: -2, msg: '删除用户失败' })
        })
})
/**
 * @api {post} /user/check  登陆检验
 * @apiName del
 * @apiGroup User
 *
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/check', (req, res) => {
    if (!req.session.login) {
        user[req.headers.username] = undefined //清除map中的key
        return res.send({ err: -999, msg: '登陆已过期,请重新登陆!' })
    }
    else {
        return res.send({ err: 0, msg: 'login check success！' })
    }
})
/**
 * @api {post} /user/checkBack  管理员登陆检验、身份校验
 * @apiName del
 * @apiGroup User
 *
 * 
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.post('/checkBack', (req, res) => {
    let { _id } = req.body;
    if (!_id) {
        return res.send({ err: -1, msg: '参数错误' })
    }
    if (!req.session.login) {
        user[req.headers.username] = undefined //清除map中的key
        return res.send({ err: -999, msg: '登陆已过期,请重新登陆!' })
    }
    else {
        User.find({ _id })
            .then((data) => {
                if (data.length > 0) {
                    if (data[0].right !== 1) {
                        //管理员鉴权 -- 若企图跨越权限访问 -- 删除sessionId
                        user[req.session.name] = undefined
                        req.session.destroy();
                        return res.send({ err: -1, msg: '该用户不是管理员！' })
                    } else {
                        return res.send({ err: 0, msg: 'login check success！' })
                    }
                }
            })
            .catch((err) => {
                res.send({ err: -2, msg: '校验失败，请重试！' })
            });
    }
})
module.exports = router;