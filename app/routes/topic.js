const Router = require('koa-router');

const {authByJwt} = require('../middleware')
const router = new Router({ prefix: '/topics' });
const { 
    find,
    findById,
    create,
    update,
} = require('../controllers/topic')
console.log(router);


router.get('/', async (ctx, next) => {
    return await find(ctx);
});

router.get('/:id', async (ctx, next) => { 
    return await findById(ctx);
});

router.post('/',authByJwt, async (ctx, next) => {
    return await create(ctx);
});

router.patch('/:id', authByJwt, async (ctx, next) => {
    return await update(ctx);
});

module.exports = router;