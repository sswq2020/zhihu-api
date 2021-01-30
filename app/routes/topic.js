const Router = require('koa-router');

const {authByJwt} = require('../middleware')
const router = new Router({ prefix: '/topics' });
const { 
    find,
    findById,
    create,
    update,
    topicListFollowers,
    checkTopicExit
} = require('../controllers/topic')
console.log(router);


router.get('/', find);

router.get('/:id', findById);

router.post('/',authByJwt,create);

router.patch('/:id', authByJwt,checkTopicExit, update);

router.get('/:id/followers',authByJwt,checkTopicExit,topicListFollowers);

module.exports = router;