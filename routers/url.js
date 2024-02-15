import express from 'express'
import { addNewURL, deleteShortUrl, editURL, promptUrlRecommendation, updateClickShortUrl } from '../functions/urlController.js';
import session from 'express-session'
import { searchData } from '../functions/universal.js';
const router = express.Router()

router.post('/url', async(req, res)=>{
    const data = req.body
    try{
        const result = await addNewURL(data).catch(console.dir);
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

router.post('/url/edit', async(req, res)=>{
    const data = req.body
    try{
        const result = await editURL(data).catch(console.dir);
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

router.post('/prompt', async(req, res)=>{
    const full = req.body.full
    try{
        const promptResult = await promptUrlRecommendation(full);
        if(promptResult){
            // return res.status(200).send({promptResult})
            return res.status(200).send({promptResult})
        }
        else{
            return res.status(400).send('error')
        }
    }catch(err){
        return res.status(400).send(err)
    }
})

router.delete('/delete_url/:shortUrl', async(req, res)=>{
    const shortUrl = await searchData('shorturls', req.params.shortUrl)
    if(shortUrl == null){
        res.render('error/error404')
    }else{
        const param = req.params.shortUrl
        deleteShortUrl(param)
        return res.status(200).send('success')
    }
})

export default router