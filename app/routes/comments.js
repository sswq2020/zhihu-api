const Router = require('koa-router');

const {authByJwt} = require('../middleware')
const router = new Router({ prefix: '/question/:questionId/answer/:answerId/comments'});
const {
    find,
    findById,
    create,
    update,
    delete: del,
    checkCommentExit,
    checkCommentator
} = require('../controllers/comments')

router.get('/', find);

router.get('/:id', findById);

router.post('/',authByJwt,create);

router.patch('/:id', authByJwt,checkCommentExit,checkCommentator, update);

router.delete('/:id',authByJwt,checkCommentExit,checkCommentator,del);

module.exports = router;
