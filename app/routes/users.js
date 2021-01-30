const Router = require('koa-router');

const {auth,checkOwner,authByJwt} = require('../middleware')
const router = new Router({ prefix: '/users' });
const { 
    login,
    find,
    findById,
    create,
    update,
    delete: del,
    follow, 
    followTopic,
    checkUserExit,
    unfollow,
    unfollowTopic,
    listFollowers,
    listFollowing,
    userFollowingTopic
} = require('../controllers/users')

 const {checkTopicExit} = require('../controllers/topic')    
console.log(router);


router.get('/', async (ctx, next) => {
    return await find(ctx);
});

router.get('/:id', async (ctx, next) => { 
    return await findById(ctx);
});

router.post('/', async (ctx, next) => {
    return await create(ctx);
});

router.patch('/:id',authByJwt,checkOwner, async (ctx, next) => {
    return await update(ctx);
});

router.delete('/:id',authByJwt,checkOwner, async (ctx, next) => {
    return await del(ctx);
});

router.post('/login',login);

router.put('/following/:id',authByJwt,checkUserExit,follow)

router.delete('/following/:id',authByJwt,checkUserExit,unfollow)

router.put('/followingTopics/:id',authByJwt,checkTopicExit,followTopic)

router.delete('/followingTopics/:id',authByJwt,checkTopicExit,unfollowTopic)

router.get('/:id/following',authByJwt,listFollowing)

router.get('/:id/followers',authByJwt,listFollowers);

router.get('/:id/followingTopics',authByJwt,userFollowingTopic)

module.exports = router;