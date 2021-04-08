/**
 * @description 编写中间件
 * @author sswq
 */

 /***这个和koa-jwt完全不同的库**/ 
const jsonwebtoken = require('jsonwebtoken')
const jwt = require('koa-jwt');
const {secret} = require('../config')
 

/**
 * @description 验证是否登录中间件方法一
 * @param {Object} ctx 
 * @param {Function} next 
 */
const auth = async (ctx,next) => {
    const {authorization = ''} = ctx.request.header; // header把所有头字段都小写了,前端本来是Authorization
    const token = authorization.replace('Bearer ', ''); // Bearer加空格
    try {
        const user = jsonwebtoken.verify(token,secret);
        ctx.state.user = user;
    } catch (error) {
        ctx.throw(401,err.message);
    }
    await next();
}

/**
 * @description 验证是否登录中间件方法二
 * @param {Object} ctx 
 * @param {Function} next 
 */
const authByJwt = jwt({secret});

/**
 * @description 验证是否是本人中间件
 * @param {Object} ctx 
 * @param {Function} next 
 */
const checkOwner = async (ctx,next) => {
    if(ctx.params.id !== ctx.state.user._id){
        ctx.throw(403,'没有权限');
    }
    await next();
}


module.exports = {
    auth,
    checkOwner,
    authByJwt   
}