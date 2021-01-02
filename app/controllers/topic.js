const jsonwebtoken = require('jsonwebtoken');
const Topic = require('../models/topic');

class TopicCtl{
   async find(ctx){
    const {per_page = 10, page = 1,q} = ctx.query;
    const count =  Math.max(per_page * 1, 1);
    const skipCount = (Math.max(page * 1, 1) - 1) * count;
    ctx.body = await Topic
    .find({name:new RegExp(q)})
    .limit(count)
    .skip(skipCount);
   }

   async findById(ctx){
    const {fields = ''} = ctx.query;
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
    ctx.body = await Topic.findById(ctx.params.id).select(selectFields); 
   }

   async create(ctx){
       ctx.verifyParams({
           name: {type: 'string',required:true},
           avatar_url:{type:'string',required:false},
           introduction:{type:'string',required:false,select:false}
       })

       const {name} = ctx.request.body;
       const repeatTopic = await Topic.findOne({name});
       if(repeatTopic){
           ctx.throw(409,'话题已存在');
           return
       }


       const topic = await new Topic(ctx.request.body).save();
       ctx.body = topic;
   }

   async update(ctx){
    ctx.verifyParams({
        name:{type:'string',required:false},
        avatar_url:{type:'string', required:false},
        introduction:{type:'string',required:false,select:false}
    })
   const topic= await Topic.findByIdAndUpdate(ctx.params.id,ctx.request.body);
    if(!topic){
        if(!topic) {ctx.throw(404,'话题不存在')};
    }
    ctx.body = topic;
}



}

module.exports = new TopicCtl();