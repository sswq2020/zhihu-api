const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/users');
const {secret} = require('../config')

class UserCtl{
    async find(ctx){
        ctx.body = await User.find();
    }

    async findById(ctx){
        const {fields} = ctx.query;
        console.log("====================");
        console.log(fields);
        console.log("====================");
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const user = await User.findById(ctx.params.id).select(selectFields); // http://www.mongoosejs.net/docs/api.html#query_Query-select
        if(!user) {ctx.throw(404,'用户不存在')};
        ctx.body = user;
    }

    async create(ctx){
        ctx.verifyParams({
            name:{type:'string',required:true},
            password:{type:'string',required:true}
        })
        const {name} = ctx.request.body;
        const repeatUser = await User.findOne({name});
        if(repeatUser){
            ctx.throw(409,'用户已占用');
            return
        }

       const user= await new User(ctx.request.body).save();
       ctx.body = user;
    }

    async update(ctx){
        ctx.verifyParams({
            name:{type:'string',required:false},
            password:{type:'string',required:false},
            avatar_url:{type:'string', required:false},
            gender:{type:'string',required:false},
            headline:{type:'string',required:false},
            locations:{type:'array',itemType:'string',required:false},
            business:{type:'string',required:false},
            employments:{type:'array',itemType:'object',required:false},
            educations:{type:'array',itemType:'object',required:false}
        })
       const user= await User.findByIdAndUpdate(ctx.params.id,ctx.request.body);
        if(!user){
            if(!user) {ctx.throw(404,'用户不存在')};
        }
        ctx.body = user;
    }

    async delete(ctx){
        const user = await User.findByIdAndRemove(ctx.params.id);
        if(!user){
            if(!user) {ctx.throw(404,'用户不存在')};
        }
        ctx.body = user;
    }

    async login(ctx){
        ctx.verifyParams({
            name:{type:'string',required:false},
            password:{type:'string',required:false}
        })
        
        const user = await User.findOne(ctx.request.body);
        if(!user){ctx.throw(401,'用户名或密码不正确')}
        const {_id,name} = user;
        const token = jsonwebtoken.sign({_id,name},secret,{expiresIn:'1d'});
        ctx.body = {token};

    }



}

module.exports = new UserCtl();