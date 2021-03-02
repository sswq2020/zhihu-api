const mongoose = require('mongoose');

const { Schema,model } = mongoose;

const answerSchema = new Schema({
    __v:{type:String,select:false},
    content:{type:String,required:true},
    answerer:{type:Schema.Types.ObjectId, ref: 'User', select:false},
    questionId:{type:String,select:true}
});

module.exports = model('Answer', answerSchema);
