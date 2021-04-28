const mongoose = require('mongoose');

const { Schema,model } = mongoose;

const commentSchema = new Schema({
    __v:{type:String,select:false},
    content:{type:String,required:true},
    commentator:{type:Schema.Types.ObjectId, ref: 'User', select:false},
    questionId:{type:String,required:true},
    answerId:{type:String,required:true}
});

module.exports = model('Comments', commentSchema);
