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
    userFollowingTopic,
    listQuestions,
    listlikingAnswers,
    listdislikingAnswers,
    likeAnswer,
    dislikeAnswer,
    unlikeAnswer,
    undislikeAnswer
} = require('../controllers/users')

 const {checkTopicExit} = require('../controllers/topic')
 const {checkAnswerExit} = require('../controllers/answer')

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

router.get('/:id/questionlist',listQuestions)

router.get('/:id/likingAnswersList',listlikingAnswers)

router.put('/likeAnswer/:id',authByJwt,checkAnswerExit,likeAnswer,undislikeAnswer)

router.delete('/likeAnswer/:id',authByJwt,checkAnswerExit,unlikeAnswer)


router.get('/:id/dislikingAnswersList',listdislikingAnswers)

router.put('/dislikeAnswer/:id',authByJwt,checkAnswerExit,dislikeAnswer,unlikeAnswer)

router.delete('/dislikeAnswer/:id',authByJwt,checkAnswerExit,undislikeAnswer)


module.exports = router;
