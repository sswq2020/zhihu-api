const mongoose = require('mongoose');

const { Schema,model } = mongoose;

const questionSchema = new Schema({
    __v:{type:String,select:false},
    title:{type:String,required:true},
    description:{type:String},
    questioner:{type:Schema.Types.ObjectId, ref: 'User', select:false},
    // 为什么在问题模型里加话题,而不是话题模型里加问题,因为一个问题一般关联10个左右的话题
    // 但是一个话题关联几百个问题,从Mongdb数据库的设计角度来看,前者最适合
    topics:{type:[{type:Schema.Types.ObjectId, ref: 'Topic', select:false}]}
});

module.exports = model('Question', questionSchema);
