//引入mongo模块
const mongoose = require('mongoose');
//连接本地数据库
mongoose.connect('mongodb://localhost/1902',{ useNewUrlParser: true,useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',function () {
    console.log('db ok')
});
