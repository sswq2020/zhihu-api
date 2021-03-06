const mongoose = require('mongoose');

const { Schema,model } = mongoose;

const commentSchema = new Schema({
    __v:{type:String,select:false},
    content:{type:String,required:true},
    commentator:{type:Schema.Types.ObjectId, ref: 'User', select:false},
    questionId:{type:String,required:true},
    rootCommentId:{type:String,required:false,select:false},
    replyTo:{type:Schema.Types.ObjectId,ref:'User',select:false},
    answerId:{type:String,required:true},

},{timestamps:true});

module.exports = model('Comments', commentSchema);
