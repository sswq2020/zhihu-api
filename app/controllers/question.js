const User = require('../models/users');
const Question = require('../models/question');

class QuestionCtl {
    /**
     * @description 查找问题列表
     * @param {Object} ctx
     * @param {Function} next
     */
    async find(ctx) {
        const { per_page = 10, page = 1 } = ctx.query;
        const count = Math.max(per_page * 1, 1);
        const skipCount = (Math.max(page * 1, 1) - 1) * count;
        const {q} = ctx.query;
        const Q = new RegExp(q);
        ctx.body = await Question
            .find({ $or: [{ title: Q }, { description: Q }] })
            .limit(count)
            .skip(skipCount);
    }

    /**
     * @description 验证问题存在
     * @param {Object} ctx
     * @param {Function} next
     */
    async checkQuestionExit(ctx, next) {
        const question = await Question.findById(ctx.params.id).select('+questioner');
        if (!question) {
            ctx.throw(404, '问题不存在');
        }
        ctx.state.question = question; // 缓存起来
        await next();
    }

    /**
     * @description 根据id查找问题列表
     * @param {Object} ctx
     * @param {Function} next
     */
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const cc = await Question.findById(ctx.params.id).select(selectFields).populate('questioner topics');
        ctx.body = cc;
    }
    /**
     * @description 创建问题
     * @param {Object} ctx
     * @param {Function} next
     */
    async create(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: true },
            description: { type: 'string', required: false },
        })

        const repeatQuestion = await Question.findOne({ ...ctx.request.body, questioner: ctx.state.user._id });
        if (repeatQuestion) {
            ctx.throw(409, '问题已存在');
            return
        }

        const question = await new Question(Object.assign({},ctx.request.body,{questioner: ctx.state.user._id})).save();
        ctx.body = question;
    }

    /**
     * @description 更新问题
     * @param {Object} ctx
     * @param {Function} next
     */
    async update(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: false },
            description: { type: 'string', required: false }
        })
        const question = await ctx.state.question.update(ctx.request.body); // 利用缓存,减少查询
        if (!question) {
            ctx.throw(404, '问题不存在');
        }
        ctx.status = 204;
    }

    /**
     * @description 删除问题
     * @param {Object} ctx
     * @param {Function} next
     */
    async delete(ctx) {
        const question = await Question.findByIdAndRemove(ctx.params.id);
        if (!question) {
           ctx.throw(404, '问题不存在') ;
        }
        ctx.status = 204;
    }

    /**
     * @description 验证是否是问题的创建者
     * @param {Object} ctx
     * @param {Function} next
     */
    async checkQuestioner(ctx, next) {
        const { question } = ctx.state // 前面中间件checkQuestionExit的缓存
        if (question.questioner.toString() !== ctx.state.user._id) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }

}

module.exports = new QuestionCtl();
