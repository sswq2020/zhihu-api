const Router = require('koa-router');
const router  =new Router({prefix:'/users'});
const {find, create, update,delete:del} = require('../controllers/users')
console.log(router);

router.get('/',async (ctx,next) =>{
    return await find(ctx);
});

router.get('/:id',async (ctx,next) =>{
    return await find(ctx);
});


router.post('/', async (ctx,next)=> {
    return await create(ctx);
});

router.put('/:id', async (ctx,next)=> {
    return await update(ctx);
});

router.delete('/:id', async (ctx,next)=> {
    return await del(ctx);
});



module.exports = router;