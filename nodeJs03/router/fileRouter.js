const express = require('express')
const router = express.Router()
const multer = require('multer')
//图片上传api存放路由，此接口不需操作数据库，服务器端存储文件

//配置图片上传插件multer的配置
var storage = multer.diskStorage({
    //设置上传后图片路径
    destination: function (req, file, cb) {
        cb(null, './static/img')
    },

    //定义图片文件名
    filename: function (req, file, cb) {
        //加上时间戳防止图片重名

        let exts = file.originalname.split('.');
        let ext = exts[exts.length - 1];
        let time = (new Date()).getTime() + parseInt(Math.random() * 9999);
        let rename = `${time}.${ext}`
        cb(null, rename)
    }
})
var upload = multer({ //生成一个multer对象
    storage: storage
})


//配置文件上传插件multer的配置
var storage1 = multer.diskStorage({
    //设置上传后文件路径
    destination: function (req, file, cb) {
        cb(null, './static/file')
    },

    //定义文件名
    filename: function (req, file, cb) {
        //加上时间戳防止文件重名

        let exts = file.originalname.split('.');
        let ext = exts[exts.length - 1];
        let time = (new Date()).getTime() + parseInt(Math.random() * 9999);
        let rename = `${time}.${ext}`
        cb(null, rename)
    }
})
var upload1 = multer({ //生成一个multer对象
    storage: storage1
})





router.post('/upload', upload.single('file'), (req, res) => {  //第二个参数指：上传的附件的主键名
    console.log(req.file)

    //限制文件大小
    let { size, mimetype, path } = req.file;
    //限制文件类型
    let types = ['jpg', 'jpeg', 'png', 'gif']
    let type = mimetype.split('/')[1];

    if (size > 500000) { //对文件上传的限制
        return res.send({ err: -1, msg: '上传文件过大' })
    } else if (types.indexOf(type) == -1) {
        return res.send({ err: -2, msg: '上传文件类型不正确' })
    } else {
        let url = `/public/img/${req.file.filename}`
        res.send({ err: 0, msg: '上传成功', img: url })
    }
})


router.post('/uploadFile', upload1.single('file'), (req, res) => {  //第二个参数指：上传的附件的主键名
    console.log(req.file)

    //限制文件大小
    let { size, mimetype, path } = req.file;
    //限制文件类型
    let types = ['jpg', 'jpeg', 'png', 'gif', 'pdf']
    let type = mimetype.split('/')[1];

    if (size > 1000000) { //对文件上传的限制
        return res.send({ err: -1, msg: '上传文件过大' })
    } else if (types.indexOf(type) == -1) {
        return res.send({ err: -2, msg: '上传文件类型不正确' })
    } else {
        let url = `/public/file/${req.file.filename}`
        res.send({ err: 0, msg: '上传成功', img: url })
    }
})





module.exports = router