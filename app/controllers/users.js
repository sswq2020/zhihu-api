const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/users');
const Question = require('../models/question');
const Answer = require('../models/answer');
const {secret} = require('../config')

class UserCtl{
    async find(ctx){
        const {per_page = 10, page = 1,q} = ctx.query;
        const count =  Math.max(per_page * 1, 1);
        const skipCount = (Math.max(page * 1, 1) - 1) * count;
        ctx.body = await User
        .find({name:new RegExp(q)})
        .limit(count)
        .skip(skipCount);
    }

    async findById(ctx){
        const {fields} = ctx.query;
        console.log("====================");
        console.log(fields);
        console.log("====================");
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const populateStr = fields.split(';').filter(f => f).map(f => {
            if(f === 'employments'){
                return 'employments.company employments.job'
            }
            if(f === 'educations'){
                return 'educations.school educations.major'
            }
            return f;
        }).join(' ');
        const user = await User.findById(ctx.params.id).select(selectFields)
        .populate(populateStr);
        ; // http://www.mongoosejs.net/docs/api.html#query_Query-select
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

    async listFollowing(ctx){
        const user =  await User.findById(ctx.params.id).select('+following').populate('following');
        if(!user){
            ctx.throw(404);
        }
        ctx.body = user.following;
    }

    async listFollowers(ctx){
        const user =  await User.find({following:ctx.params.id});
        ctx.body = user;
    }

    async follow(ctx){
        const me = await User.findById(ctx.state.user._id).select('+following')
        if(!me.following.map(id => id.toString()).includes(ctx.params.id)){
            me.following.push(ctx.params.id);
            me.save();
        }
         ctx.status = 204;
    }

    async unfollow(ctx){
        const me = await User.findById(ctx.state.user._id).select('+following')
        const index = me.following.findIndex(id => id.toString() === ctx.params.id)
        if(index > -1)  {
            me.following.splice(index,1);
            me.save();
        }
         ctx.status = 204;
    }

    async followTopic(ctx){
        const me = await User.findById(ctx.state.user._id).select('+followingTopics')
        if(!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)){
            me.followingTopics.push(ctx.params.id);
            me.save();
        }
         ctx.status = 204;
    }

    async unfollowTopic(ctx){
        const me = await User.findById(ctx.state.user._id).select('+followingTopics')
        const index = me.followingTopics.findIndex(id => id.toString() === ctx.params.id)
        if(index > -1)  {
            me.followingTopics.splice(index,1);
            me.save();
        }
         ctx.status = 204;
    }

    async userFollowingTopic(ctx){
        const user =  await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics');
        if(!user){
            ctx.throw(404,'用户不存在');
        }
        ctx.body = user.followingTopics;
    }

    /**
     * @description 检查用户是否存在
     * @param {*} ctx
     * @param {*} next
     */
    async checkUserExit(ctx,next) {
       const user = await User.findById(ctx.params.id);
       if(!user){
          ctx.throw(404,'没有该用户');
       }
       await next();
    }

    /**
     * @description 获取用户下的问题列表
     * @param {*} ctx
     */
    async listQuestions(ctx){
        const questions = await Question.find({questioner:ctx.params.id});
        ctx.body = questions;
    }

    /**
     * @description 获取用户下的点赞的答案列表
     * @param {*} ctx
     */
    async listlikingAnswers(ctx){
        const user =  await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers');
        if(!user){
            ctx.throw(404);
        }
        ctx.body = user.likingAnswers;
    }

    /**
     * @description 点赞答案
     * @param {*} ctx
     */
    async likeAnswer(ctx,next){
        const me =  await User.findById(ctx.state.user._id).select('+likingAnswers')
       if(!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)){
           me.likingAnswers.push(ctx.params.id);
           me.save();
            await Answer.findByIdAndUpdate(ctx.params.id,{$inc:{voteCount: 1}});
       };
        ctx.status = 204;
        await next();
    }

    /**
     * @description 取消点赞答案
     * @param {*} ctx
     */
    async unlikeAnswer(ctx){
        const me =await User.findById(ctx.state.user._id).select('+likingAnswers');
        console.log(me);

        const index = me.likingAnswers.findIndex(id => id.toString() === ctx.params.id)
        if(index > -1)  {
            me.likingAnswers.splice(index,1);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id,{$inc:{voteCount: -1}});
        }
         ctx.status = 204;
    }

    /**
     * @description 获取用户下的踩的答案列表
     * @param {*} ctx
     */
    async listdislikingAnswers(ctx){
        const user =  await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers');
        if(!user){
            ctx.throw(404);
        }
        ctx.body = user.dislikingAnswers;
    }

    /**
     * @description 用户睬答案
     * @param {*} ctx
     */
    async dislikeAnswer(ctx,next){
        const me =  await User.findById(ctx.state.user._id).select('+dislikingAnswers')
       if(!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)){
           me.dislikingAnswers.push(ctx.params.id);
           me.save();
       };
        ctx.status = 204;
        await next();
    }

    /**
     * @description 用户取消睬答案
     * @param {*} ctx
     */
    async undislikeAnswer(ctx){
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
        const index = me.dislikingAnswers.findIndex(id => id.toString() === ctx.params.id)
        if(index > -1)  {
            me.dislikingAnswers.splice(index,1);
            me.save();
        }
         ctx.status = 204;
    }

    /**
     * @description 收藏答案
     * @param {*} ctx
     */
    async favorAnswer(ctx){
        const me =  await User.findById(ctx.state.user._id).select('+favoritesAnswers')
        if(!me.favoritesAnswers.map(id => id.toString()).includes(ctx.params.id)){
            me.favoritesAnswers.push(ctx.params.id);
            me.save();
        };
      ctx.status = 204;
    }


    /**
     * @description 获取用户下的收藏的答案列表
     * @param {*} ctx
     */
     async listfavoriteAnswers(ctx){
        const user =  await User.findById(ctx.params.id).select('+favoritesAnswers').populate('favoritesAnswers');
        if(!user){
            ctx.throw(404);
        }
        ctx.body = user.favoritesAnswers;
    }


    /**
     * @description 用户取消收藏答案
     * @param {*} ctx
     */
    async cancelfavoritesAnswers(ctx){
       const me = await User.findById(ctx.state.user._id).select('+favoritesAnswers')
       const index = me.favoritesAnswers.findIndex(id => id.toString() === ctx.params.id)
       if(index > -1)  {
          me.favoritesAnswers.splice(index,1);
          me.save();
       }
        ctx.status = 204;
}

}

module.exports = new UserCtl();
