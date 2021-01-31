const Router = require('koa-router');

const {authByJwt} = require('../middleware')
const router = new Router({ prefix: '/question' });
const { 
    find,
    findById,
    create,
    update,
    delete: del,
    checkQuestionExit,
    checkQuestioner
} = require('../controllers/question')

router.get('/', find);

router.get('/:id', findById);

router.post('/',authByJwt,create);

router.patch('/:id', authByJwt,checkQuestionExit,checkQuestioner, update);

router.delete('/:id',authByJwt,checkQuestionExit,checkQuestioner,del);

module.exports = router;