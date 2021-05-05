const User = require('../models/users');
const Comments = require('../models/comments');

class CommentsCtl {
    /**
     * @description 查找评论列表
     * @param {Object} ctx
     * @param {Function} next
     */
    async find(ctx) {
        const { per_page = 10, page = 1 } = ctx.query;
        const count = Math.max(per_page * 1, 1);
        const skipCount = (Math.max(page * 1, 1) - 1) * count;
        const {q, rootCommentId} = ctx.query;
        const {questionId,answerId} = ctx.params;
        const Q = new RegExp(q);
        ctx.body = await Comments
            .find({ content: Q,questionId,answerId,rootCommentId })
            .limit(count)
            .skip(skipCount)
            .populate('commentator replyTo');
    }

    /**
     * @description 验证评论存在
     * @param {Object} ctx
     * @param {Function} next
     */
    async checkCommentExit(ctx, next) {
        const comment = await Comments.findById(ctx.params.id).select('+commentator');
        if (!comment) {
            ctx.throw(404, '评论不存在');
        }

        if (ctx.params.questionId && comment.questionId.toString() !== ctx.params.questionId){
            ctx.throw(404, '该问题下没有此评论');
        }

        if (ctx.params.answerId && comment.answerId.toString() !== ctx.params.answerId){
            ctx.throw(404, '该答案下没有此评论');
        }

        ctx.state.comment = comment; // 缓存起来
        await next();
    }

    /**
     * @description 根据id查找评论列表
     * @param {Object} ctx
     * @param {Function} next
     */
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        ctx.body = await Comments.findById(ctx.params.id).select(selectFields).populate('commentator');
    }
    /**
     * @description 创建评论
     * @param {Object} ctx
     * @param {Function} next
     */
    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true },
            rootCommentId: {type: 'string', required: false},
            replyTo: {type:'string', required :false}
        })

        const comment = await new Comments(
            Object.assign(
                {},
                ctx.request.body,
                {commentator: ctx.state.user._id},
                {questionId:ctx.params.questionId},
                {answerId:ctx.params.answerId}
                )).save();
        ctx.body = comment;
    }

    /**
     * @description 更新评论
     * @param {Object} ctx
     * @param {Function} next
     */
    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false }
        })
        const {content} = ctx.request.body; //  只允许更新内容
        const comment = await ctx.state.comment.update({content}); // 利用缓存,减少查询
        if (!comment) {
            ctx.throw(404, '评论不存在');
        }
        ctx.status = 204;
    }

    /**
     * @description 删除问题
     * @param {Object} ctx
     * @param {Function} next
     */
    async delete(ctx) {
        const comment = await Comments.findByIdAndRemove(ctx.params.id);
        if (!comment) {
           ctx.throw(404, '评论不存在') ;
        }
        ctx.status = 204;
    }

    /**
     * @description 验证是否该评论的评论人
     * @param {Object} ctx
     * @param {Function} next
     */
    async checkCommentator(ctx, next) {
        const { comment } = ctx.state // 前面中间件checkcommentExit的缓存
        if (comment.commentator.toString() !== ctx.state.user._id) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }

}

module.exports = new CommentsCtl();
