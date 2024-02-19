import express from 'express'
import { filterData, getAllBioLink, getAllUrl, sortDataBioLink, updateClickShortUrl } from '../functions/urlController.js';
import { searchData } from '../functions/universal.js';
import { isLoggedIn } from '../middleware/middleware.js';
import { getAllPriceList } from '../functions/planController.js';

const app = express() 
const router = express.Router();


router.get('/', (req, res)=>{
    res.render('user/home')
})

router.get('/login', (req, res)=>{
    res.render('user/login')
})

router.get('/register', (req, res)=>{
    res.render('user/register')
})

router.get('/user', async (req, res)=>{
    // ini nanti diambil email dari session lalu dilakukan search data untuk get user yang bersangkutan
    // console.log(await searchData('users', 'botan@gmail.com'));
    // dikasi middleware juga kalau sudah login atau belum
    res.render('user/profile/userProfile', {data: await searchData('users', 'botan@gmail.com')})
})

router.get('/plan/custom', async (req, res)=>{
    res.render('user/plan/customPlans', {plans: await getAllPriceList()})
})

router.get('/url', async (req, res)=>{
    //ex: if the url is /qr?mikochi, title variable value will be mikochi
    const title = req.url.includes('?') ? req.url.split('?')[1] : ''
    //jangan lupa nanti add filter untuk user 
    res.render('user/url/urlView', {allUrl: await filterData({title}, await getAllUrl())})
})

router.get('/url/edit/:shortUrl', async(req, res) =>{
    const shortUrl = await searchData('shorturls', req.params.shortUrl)
    if(!shortUrl){
        res.render('error/error404')
    }else{
        res.render('user/url/urlEditView', {data: shortUrl})
    }
})

//example used of middleware (if not loggedIn then can't access this particular page)
// router.get('/qr', isLoggedIn, async (req, res)=>{
router.get('/qr', async (req, res)=>{
    //ex: if the url is /qr?mikochi, title variable value will be mikochi
    const title = req.url.includes('?') ? req.url.split('?')[1] : ''
    //jangan lupa nanti add filter untuk user 
    res.render('user/qr/qrView', {allUrl: await filterData({type: 'qr', title}, await getAllUrl())})
})

//lakukan pengechekan kalau yang bisa edit adalah user yang bersangkutan
router.get('/qr/edit/:shortUrl', async(req, res) =>{
    const shortUrl = await searchData('shorturls', req.params.shortUrl)
    if(!shortUrl || shortUrl.type != 'qr'){
        res.render('error/error404')
    }else{
        res.render('user/qr/qrEditView', {data: shortUrl})
    }
})

router.get('/biolink', async (req, res)=>{
    const title = req.url.includes('?') ? req.url.split('?')[1] : ''
    //jangan lupa nanti add filter untuk user 
    res.render('user/biolink/bioView', {allUrl: await filterData({title}, await getAllBioLink())})
})

router.get('/biolink/edit/:bioLink', async(req, res) =>{
    const param = req.params.bioLink
    const bioLink = await searchData('biolinks', req.params.bioLink)
    const paramType = req.url.includes('?') ? req.url.split('?')[1] : 'build'
    var allUrl = await filterData({bioLink: param}, await getAllUrl()) 
    var sortedUrl = await sortDataBioLink(allUrl)
    if(!bioLink){
        res.render('error/error404')
    }else{
        res.render('user/biolink/bioEditView', {data: bioLink, paramType, allUrl: sortedUrl, path: 'edit'})
    }
})

router.get('/m/:bioLink', async (req, res)=>{
    const param = req.params.bioLink
    const bioLink = await searchData('biolinks', req.params.bioLink)
    var allUrl = await filterData({bioLink: param}, await getAllUrl()) 
    var sortedUrl = await sortDataBioLink(allUrl)
    if(!bioLink){
        res.render('error/error404')
    }else{
        res.render('user/biolink/bioPreview', {data: bioLink, allUrl: sortedUrl, paramType: 'web', path: 'webview'})
    }
})


router.get('/:shortUrl', async(req,res)=>{
    const shortUrl = await searchData('shorturls', req.params.shortUrl)
    if(!shortUrl){
        res.render('error/error404')
    }else{
        const param = req.params.shortUrl
        updateClickShortUrl(param)
        res.redirect(shortUrl.full)
    }
})



export default router
