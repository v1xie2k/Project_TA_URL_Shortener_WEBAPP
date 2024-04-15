import express from 'express'
import { editBioLink, filterData, getAllBioLink, getAllQr, getAllShortUrl, getAllUrl, getReports, sortBlocksBioLink, sortDataBioLink, updateClickShortUrl } from '../functions/urlController.js';
import { searchData } from '../functions/universal.js';
import { isAdmin, isLoggedIn } from '../middleware/middleware.js';
import { getAllInvoice, getAllPlans, getAllPriceList, getIncome, getInvoices, sortPlans } from '../functions/planController.js';
import 'dotenv/config'
import moment from 'moment';
import { getUsers } from '../functions/userController.js';

const app = express() 
const router = express.Router();

router.get('/', (req, res)=>{
    res.locals.user = req.session.user
    res.render('user/home')
})

router.get('/login', (req, res)=>{
    if(req.session.user){
        res.redirect('back')
    }else{
        res.render('user/login')
    }
})

router.get('/register', (req, res)=>{
    if(req.session.user){
        res.redirect('back')
    }else{
        res.render('user/register')
    }
})

router.get('/user', isLoggedIn, async (req, res)=>{
    // ini nanti diambil email dari session lalu dilakukan search data untuk get user yang bersangkutan
    res.locals.user = req.session.user
    res.render('user/profile/userProfile', {data: await searchData('users', req.session.user.email)})
})

router.get('/plan', isLoggedIn, async (req, res)=>{
    res.locals.user = req.session.user
    const midtransClientKey = process.env.midtrans_client_key
    const sort = req.url.includes('?') ? req.url.split('?')[1] : ''
    const plans = await sortPlans(await getAllPlans(), sort)
    res.render('user/plan/subscriptionPlan', {plans, midtransClientKey, sort})
})

router.get('/plan/custom', isLoggedIn, async (req, res)=>{
    res.locals.user = req.session.user
    const midtransClientKey = process.env.midtrans_client_key
    res.render('user/plan/customPlans', {plans: await getAllPriceList(), midtransClientKey})
})

router.get('/plan/history', isLoggedIn, async (req, res)=>{
    res.locals.user = req.session.user
    
    const dateFrom = req.url.includes('df=') ? req.url.split('df=')[1].substring(0, 10) : moment().startOf('month').format('YYYY-MM-DD')
    const dateTo = req.url.includes('dt=') ? req.url.split('dt=')[1] : moment().endOf('month').format('YYYY-MM-DD')
    const filter = {}
    if(dateFrom) filter.dateFrom = dateFrom
    if(dateTo) filter.dateTo = dateTo
    const allInvoice = await getAllInvoice(req.session.user.email, filter)
    const midtransClientKey = process.env.midtrans_client_key
    res.render('user/plan/historySubscription', {midtransClientKey, allInvoice, dateFrom, dateTo})
})

router.get('/analytic', isLoggedIn, async (req, res)=>{
    res.locals.user = req.session.user
    const report = await getReports(req.session.user.email)
    // nanti getReport ini ambil semua log data dari url & biolink yang ada, lalu di get semua dan di send semua (nanti filter dll di frontend)
    res.render('user/analytic/dashboard', {report})
})

router.get('/admin', isAdmin, async (req, res)=>{
    res.locals.user = req.session.user
    const users = await getUsers(req.session.user.email)
    res.render('admin/userReport', {users})
})

router.get('/admin/plan', isAdmin,async (req, res)=>{
    res.locals.user = req.session.user
    const services = await getAllPriceList()
    const plans = await getAllPlans()
    res.render('admin/subscriptionPlan', {services, plans})
})


router.get('/admin/service', isAdmin, async (req, res)=>{
    res.locals.user = req.session.user
    const allUrl = await getAllShortUrl()
    const allQr = await getAllQr()
    const allBioLink = await getAllBioLink()
    res.render('admin/serviceReport', {allUrl, allQr, allBioLink})
})

router.get('/admin/transaction', isAdmin, async (req, res)=>{
    res.locals.user = req.session.user
    const filter = {}
    const dateFrom = req.url.includes('df=') ? req.url.split('df=')[1].substring(0, 10) : moment().startOf('month').format('YYYY-MM-DD')
    const dateTo = req.url.includes('dt=') ? req.url.split('dt=')[1].substring(0, 10) : moment().endOf('month').format('YYYY-MM-DD')
    const type = req.url.includes('type=') ? req.url.split('type=')[1].substring(0, 1) : undefined
    if(dateFrom) filter.dateFrom = dateFrom
    if(dateTo) filter.dateTo = dateTo
    if(type) filter.type = type
    const transactions = await getInvoices(filter)
    const income = await getIncome(filter)
    res.render('admin/transactionReport', {transactions, dateFrom, dateTo, type, income})
})

router.get('/url', isLoggedIn, async (req, res)=>{
    res.locals.user = req.session.user
    //ex: if the url is /qr?mikochi, title variable value will be mikochi
    const title = req.url.includes('?') ? req.url.split('?')[1] : ''
    res.render('user/url/urlView', {allUrl: await filterData({user: req.session.user.email, title}, await getAllUrl())})
})

router.get('/url/edit/:shortUrl', isLoggedIn, async (req, res) =>{
    res.locals.user = req.session.user
    const shortUrl = await searchData('shorturls', req.params.shortUrl)
    if(!shortUrl){
        res.render('error/error404')
    }else{
        if(shortUrl.createdBy != req.session.user.email){
            res.render('error/error403')
        }else{
            res.render('user/url/urlEditView', {data: shortUrl})
        }
    }
})

router.get('/url/view/:shortUrl', isLoggedIn, async (req, res)=>{
    res.locals.user = req.session.user
    const shortUrl = await searchData('shorturls', req.params.shortUrl)
    if(!shortUrl){
        res.render('error/error404')
    }else{
        if(shortUrl.createdBy != req.session.user.email){
            res.render('error/error403')
        }else{
            res.render('user/url/urlDetailView', {data: shortUrl})
        }
    }
})

router.get('/qr', isLoggedIn, async (req, res)=>{
    res.locals.user = req.session.user
    //ex: if the url is /qr?mikochi, title variable value will be mikochi
    const title = req.url.includes('?') ? req.url.split('?')[1] : ''
    res.render('user/qr/qrView', {allUrl: await filterData({user: req.session.user.email, type: 'qr', title}, await getAllUrl())})
})

router.get('/qr/edit/:shortUrl', isLoggedIn, async (req, res) =>{
    res.locals.user = req.session.user
    const shortUrl = await searchData('shorturls', req.params.shortUrl)
    if(!shortUrl || shortUrl.type != 'qr'){
        res.render('error/error404')
    }else{
        if(shortUrl.createdBy != req.session.user.email){
            res.render('error/error403')
        }else{
            res.render('user/qr/qrEditView', {data: shortUrl})
        }
    }
})

router.get('/biolink', isLoggedIn, async (req, res)=>{
    res.locals.user = req.session.user
    const title = req.url.includes('?') ? req.url.split('?')[1] : ''
    const allBio = await filterData({user: req.session.user.email, title}, await getAllBioLink())
    for (const object of allBio) {
        if(object.blocks){
            object.blocks = await sortBlocksBioLink(object)
        }
    }
    const allUrl = await filterData({user: req.session.user.email}, await getAllUrl()) 
    res.render('user/biolink/bioView', {allBio, allUrl})
})

router.get('/biolink/edit/:bioLink', isLoggedIn, async (req, res) =>{
    res.locals.user = req.session.user
    const param = req.params.bioLink
    const bioLink = await searchData('biolinks', req.params.bioLink)
    const paramType = req.url.includes('?') ? req.url.split('?')[1] : 'build'
    var sortedBlocks = bioLink.blocks ? await sortBlocksBioLink(bioLink) : []
    var allUrl = await filterData({user: req.session.user.email, bioLink: param}, await getAllUrl()) 
    var sortedUrl = await sortDataBioLink(allUrl)
    if(!bioLink){
        res.render('error/error404')
    }else{
        if(bioLink.createdBy != req.session.user.email){
            res.render('error/error403')
        }else{
            res.render('user/biolink/bioEditView', {data: bioLink, paramType, blocks: sortedBlocks, path: 'edit', allUrl: sortedUrl, bioLink: bioLink.short})
        }
    }
})

router.get('/view/pdf/:pdf', async (req,res)=>{
    var status = false
    var update = false
    var location = 'error/error404'
    var pdfLink 
    const pdf = req.params.pdf 
    const bioLink = await getAllBioLink()
    for (const bio of bioLink) {
        const blocks = bio.blocks
        if(blocks && blocks.length > 0){
            for (const block of blocks) {
                if(block.pdf ){
                    const pdfName = block.pdf.split('/')[4]
                    if(pdfName == pdf){
                        pdfLink = block.pdf
                        status = true
                        update = true
                        block.click++
                    }
                }
            }
            if(update){
                update =false
                const data = {oldShort: bio.short, short: bio.short, blocks}
                const result = await editBioLink(data).catch(console.dir)
            }
        }
    }
    if(status) {
        location = 'user/pdf/pdfView' 
    }
    res.render(location, {pdf: pdfLink})
})

router.get('/m/:bioLink', async (req, res)=>{
    const param = req.params.bioLink
    const bioLink = await searchData('biolinks', req.params.bioLink)
    if(!bioLink){
        res.render('error/error404')
    }else{
        var sortedBlocks = await sortBlocksBioLink(bioLink)
        // this api is for detecting user's region(location)
        var fetchCountry = await fetch(`https://ipapi.co/${req.ips}/json/`);
        var getCountry = await fetchCountry.json()
        var referer = await req.headers.referer
        updateClickShortUrl('biolinks', param, req.headers['user-agent'], getCountry.country_name, referer)
        res.render('user/biolink/bioPreview', {data: bioLink, blocks: sortedBlocks, paramType: 'web', path: 'webview', bioLink: bioLink.short})
        
    }
})


router.get('/:shortUrl', async (req,res)=>{
    const shortUrl = await searchData('shorturls', req.params.shortUrl)
    if(!shortUrl){
        res.render('error/error404')
    }else{
        const param = req.params.shortUrl
        //this api is for detecting user's region(location)
        var fetchCountry = await fetch(`https://ipapi.co/${req.ips[0]}/json/`);
        var getCountry = await fetchCountry.json()
        updateClickShortUrl('shorturls', param, req.headers['user-agent'], getCountry.country_name, '')
        res.redirect(shortUrl.full)
    }
})




export default router
