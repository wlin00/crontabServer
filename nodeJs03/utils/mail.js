'use strict';
const nodemailer = require('nodemailer');

function send(mail,code) {

    //创建发送邮件的请求对象
    let transporter = nodemailer.createTransport({
        host: 'smtp.qq.com', //发送方邮箱host 来自于lib中services.json
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {  //oauth授权机制 : 用户id或者用户secrt来换取access token ，从而成功进行第三方请求

            user: '616294069@qq.com', // generated ethereal user
            pass: 'adlpmjzqjgxrbehd' // generated ethereal password
        }
    });

    // 创建邮件对象
    let mailobj = {
        from: '"Fred Foo 👻" <616294069@qq.com>', // sender address
        to: mail, // list of receivers
        subject: '验证码', // Subject line
        text: `您的验证码是${code}`, // plain text body
        // html: '<b>Offer of SenseTime</b>' // html body
    };

    return new Promise((resolve,reject)=>{
        transporter.sendMail(mailobj,(err,data)=>{
            if(err){
                reject('发送邮件失败');
            }else{
                resolve('发送邮件成功');
            }
        })

    })

}


module.exports={send:send}; //向外部抛出方法
