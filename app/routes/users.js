const Router = require('koa-router');

const {auth,checkOwner,authByJwt} = require('../middleware')
const router = new Router({ prefix: '/users' });
const { 
    login,
    find,
    findById,
    create,
    update,
    delete: del } = require('../controllers/users')
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





module.exports = router;