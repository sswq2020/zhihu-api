const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const error = require('koa-json-error');
const parameter = require('koa-parameter');
const app = new Koa();
const routing = require('./routes')
const mongoose = require('mongoose')
const {connectionStr} = require('./config')
 

mongoose.connect(connectionStr,{ useUnifiedTopology: true },()=>{
    console.log('连接成功')
})

mongoose.connection.on('error',console.error)


app.use(error({
    postFormat:(e,{stack,...rest}) => process.env.NODE_ENV === 'production' ? rest : {stack,...rest}
}))

app.use(bodyParser());
app.use(parameter(app));
routing(app)
app.listen(2000);