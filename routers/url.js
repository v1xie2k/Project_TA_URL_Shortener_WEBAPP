import express from 'express'
import { addNewURL, searchShortUrl, updateClickShortUrl } from '../functions/urlController.js';
import session from 'express-session'
const router = express.Router()

router.post('/shortUrls', async(req, res)=>{
    const full = req.body.full
    const short = req.body.short
    try{
        const result = await addNewURL({full, short, clicks:0}).catch(console.dir);
        if(result){
            return res.status(200).send('success')
        }
        else{
            return res.status(400).send('error')
        }
    }catch(err){
        return res.status(400).send(err)
    }
})

router.post('/qrcode', async(req, res)=>{
    const full = req.body.full
    const title = req.body.title
    const short = req.body.short
    try{
        const result = await addNewURL({full, short, title, clicks:0, type: 'qr', createdAt: new Date()}).catch(console.dir);
        if(result){
            return res.status(200).send('success')
        }
        else{
            return res.status(400).send('error')
        }
    }catch(err){
        return res.status(400).send(err)
    }
})
export default router