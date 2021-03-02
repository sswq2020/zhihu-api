const Router = require('koa-router');

const {authByJwt} = require('../middleware')
const router = new Router({ prefix: '/question/:questionId/answer'});
const {
    find,
    findById,
    create,
    update,
    delete: del,
    checkAnswerExit,
    checkAnswerer
} = require('../controllers/answer')

router.get('/', find);

router.get('/:id', findById);

router.post('/',authByJwt,create);

router.patch('/:id', authByJwt,checkAnswerExit,checkAnswerer, update);

router.delete('/:id',authByJwt,checkAnswerExit,checkAnswerer,del);

module.exports = router;
