const User = require('../models/users');
const Answer = require('../models/answer');

class AnswerCtl {
    /**
     * @description 查找答案列表
     * @param {Object} ctx
     * @param {Function} next
     */
    async find(ctx) {
        const { per_page = 10, page = 1 } = ctx.query;
        const count = Math.max(per_page * 1, 1);
        const skipCount = (Math.max(page * 1, 1) - 1) * count;
        const {q} = ctx.query;
        const Q = new RegExp(q);
        ctx.body = await Answer
            .find({ content: Q,questionId:ctx.params.questionId })
            .limit(count)
            .skip(skipCount);
    }

    /**
     * @description 验证答案存在
     * @param {Object} ctx
     * @param {Function} next
     */
    async checkAnswerExit(ctx, next) {
        const answer = await Answer.findById(ctx.params.id).select('+answerer');
        if (!answer) {
            ctx.throw(404, '答案不存在');
        }
        // 赞和睬不检查
        if (ctx.params.questionId && answer.questionId !== ctx.params.questionId){
            ctx.throw(404, '该问题下没有此答案');
        }
        ctx.state.answer = answer; // 缓存起来
        await next();
    }

    /**
     * @description 根据id查找答案列表
     * @param {Object} ctx
     * @param {Function} next
     */
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        ctx.body = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer');
    }
    /**
     * @description 创建答案
     * @param {Object} ctx
     * @param {Function} next
     */
    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true }
        })

        const repeatAnswer = await Answer.findOne({ ...ctx.request.body, answerer: ctx.state.user._id });
        if (repeatAnswer) {
            ctx.throw(409, '问题已存在');
            return
        }

        const answer = await new Answer(
            Object.assign(
                {},
                ctx.request.body,
                {answerer: ctx.state.user._id},
                {questionId:ctx.params.questionId}
                )).save();
        ctx.body = answer;
    }

    /**
     * @description 更新答案
     * @param {Object} ctx
     * @param {Function} next
     */
    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false }
        })
        const answer = await ctx.state.answer.update(ctx.request.body); // 利用缓存,减少查询
        if (!answer) {
            ctx.throw(404, '答案不存在');
        }
        ctx.status = 204;
    }

    /**
     * @description 删除问题
     * @param {Object} ctx
     * @param {Function} next
     */
    async delete(ctx) {
        const answer = await Answer.findByIdAndRemove(ctx.params.id);
        if (!answer) {
           ctx.throw(404, '答案不存在') ;
        }
        ctx.status = 204;
    }

    /**
     * @description 验证是否是问题的创建者
     * @param {Object} ctx
     * @param {Function} next
     */
    async checkAnswerer(ctx, next) {
        const { answer } = ctx.state // 前面中间件checkAnswerExit的缓存
        if (answer.answerer.toString() !== ctx.state.user._id) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }

}

module.exports = new AnswerCtl();
