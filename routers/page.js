import express from 'express'
import { filterData, getAllUrl, searchShortUrl, updateClickShortUrl } from '../functions/urlController.js';
import session from 'express-session'

const app = express() 
const router = express.Router();

app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next(); // User is authenticated, continue to next middleware
    } else {
        res.redirect('/login'); // User is not authenticated, redirect to login page
    }
}


router.get('/', (req, res)=>{
    res.render('user/index')
})

router.get('/qr', async (req, res)=>{
    //jangan lupa nanti add filter untuk user 
    res.render('user/qr/qr', {allUrl: await filterData({type: 'qr'}, await getAllUrl())})
})

//lakukan pengechekan kalau yang bisa edit adalah user yang bersangkutan
router.get('/qr/edit/:shortUrl', async(req, res) =>{
    const shortUrl = await searchShortUrl(req.params.shortUrl)
    if(shortUrl == null){
        res.render('user/error404')
    }else{
        res.render('user/qr/qrEdit', {data: shortUrl})
    }
})

router.get('/biolink', (req, res)=>{
    res.render('user/biolink')
})

router.get('/:shortUrl', async(req,res)=>{
    const shortUrl = await searchShortUrl(req.params.shortUrl)
    if(shortUrl == null){
        res.render('user/error404')
    }else{
        const param = req.params.shortUrl
        updateClickShortUrl(param)
        res.redirect(shortUrl.full)
    }
})



export default router
