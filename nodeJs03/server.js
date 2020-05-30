   //入口文件
const express = require('express');//封装本地服务器，连接mongo数据库，提供api接口
const cookieParser = require('cookie-parser')
const session = require('express-session')
const request = require('request')
const app = express();//获得一个服务器实例



app.all('*',function(req, res, next) {
   //需要显式设置来源,不能写*
   res.header("Access-Control-Allow-Origin", req.headers.origin);
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
   res.header("Access-Control-Allow-Credentials",true);
 //带cookies
   // res.header("Content-Type", "application/json;charset=utf-8");
  next();
});
//设置cors跨域
const cors = require('cors');
app.use(cors());


//session 整体配置
app.use(session({
   secret:'ghjgkgkj',  //为安全性考虑设置的secret属性
   cookie:{maxAge:60*1000*30}, //sessionId过期时间30分钟
   resave:true,    //即使session没有被修改，也保存session值
   saveUninitialized:false // 每次请求是否重新生成session cookie
}))

//建立静态目录
const path = require('path')
app.use('/public',express.static(path.join(__dirname,'./static')))


const bodyParser = require('body-parser');//使用bodyparse 插件 --  解析后，可以从request.body中拿消息体内容
app.use(bodyParser.urlencoded({extend:false}));   //解析post请求消息体的表单数据--x-www-urlencode
app.use(bodyParser.json());   //解析json格式
app.use(cookieParser());
// 启动服务器时，连接数据库
const db = require('./db/connect');

//引入路由中间件，里面封装了关于用户登录注册的接口
const  userRouter  = require('./router/userRouter');
//路由中间件，关于食物增删改查CURD的接口
const foodRouter = require('./router/foodRouter')
//路由中间件，关于文件操作的api接口集合
const fileRouter = require('./router/fileRouter')
//路由中间件，轮播图区域
const picRouter = require('./router/picRouter')
//路由中间件，信息区域
const infoRouter = require('./router/infoRouter')
//路由中间件，文件区域
const myFileRouter = require('./router/myFileRouter')




//毕设区域
app.use('/zjj/user',(req,res,next)=>{
   next()
},userRouter); //引入userRouter路由作为路径/user下的中间件

app.use('/zjj/file',fileRouter);//引入fileRouter路由作为路径/file下的中间件
app.use('/zjj/pic',picRouter);//引入fileRouter路由作为路径/file下的中间件
app.use('/zjj/info',infoRouter);//引入fileRouter路由作为路径/file下的中间件
app.use('/zjj/myFile',myFileRouter);//引入fileRouter路由作为路径/file下的中间件


//Food-Demo区域
app.use('/food',(req,res,next)=>{
   if(req.session.login){
       next()
   }else{
      res.send({err:999,msg:' login'})
   }
},foodRouter);//引入foodRouter路由作为路径/food下的中间件


app.listen(3001,()=>{
console.log('server start')     //callback of server-start
});




