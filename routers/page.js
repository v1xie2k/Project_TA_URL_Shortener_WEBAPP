import express from 'express'
import { filterData, getAllBioLink, getAllUrl, sortDataBioLink, updateClickShortUrl } from '../functions/urlController.js';
import { searchData } from '../functions/universal.js';
import { isLoggedIn } from '../middleware/middleware.js';

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
        res.render('user/biolink/bioEditView', {data: bioLink, paramType, allUrl: sortedUrl})
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
        res.render('user/biolink/bioPreview', {data: bioLink, allUrl: sortedUrl, paramType: 'web'})
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
