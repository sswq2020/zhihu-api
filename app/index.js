const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static')
const error = require('koa-json-error');
const parameter = require('koa-parameter');
const app = new Koa();
const path = require('path');
const routing = require('./routes')
const mongoose = require('mongoose')
const {connectionStr} = require('./config')


mongoose.connect(connectionStr,{ useUnifiedTopology: true },()=>{
    console.log('连接成功了')
})

mongoose.connection.on('error',console.error)


app.use(koaStatic(path.join(__dirname,'public')))
app.use(error({
    postFormat:(e,{stack,...rest}) => process.env.NODE_ENV === 'production' ? rest : {stack,...rest}
}))

app.use(koaBody({
    multipart:true,
    formidable:{
        uploadDir: path.join(__dirname,'public/uploads'),
        keepExtensions:true
    }
}));
app.use(parameter(app));
routing(app)
app.listen(2000);
