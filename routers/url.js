import express from 'express'
import { addNewBioLink, addNewURL, deleteImage, deleteUrl, editURL, promptUrlRecommendation, updateClickShortUrl, uploadImage } from '../functions/urlController.js';
import { searchData } from '../functions/universal.js';
import session from 'express-session'
import axios from 'axios'
import Multer from 'multer'
import 'dotenv/config'
import { bucket } from '../config/cloudStorage.js';

const router = express.Router()

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // No larger than 5mb, change as you need
    },
});

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

router.delete('/delete_url/:shortUrl', async(req, res)=>{
    const shortUrl = await searchData('shorturls', req.params.shortUrl)
    if(shortUrl == null){
        res.render('error/error404')
    }else{
        const param = req.params.shortUrl
        deleteUrl(param, 'shorturls')
        return res.status(200).send('success')
    }
})

router.post('/biolink', async(req, res)=>{
    const data = req.body
    try{
        const result = await addNewBioLink(data).catch(console.dir);
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

// router.post('/biolink/edit', async(req, res)=>{
//     const data = req.body
//     try{
//         const result = await editURL(data).catch(console.dir);
//         if(result){
//             return res.status(200).send('success')
//         }
//         else{
//             return res.status(400).send('error')
//         }
//     }catch(err){
//         return res.status(400).send(err)
//     }
// })

router.post('/getYoutubeInfo', async(req, res)=>{
    const api_key = process.env.gcp_service_api_key
    const body = req.body
    const videoId = req.body.youtubeId
    var result
    axios.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + api_key).then(async response => {
        return res.status(200).send({result: response.data})
    }).catch(error => {
        console.log(error);
        return res.status(400).send('failed')
    })
})

router.delete('/delete_bio_link/:shortUrl', async(req, res)=>{
    const shortUrl = await searchData('biolinks', req.params.shortUrl)
    if(shortUrl == null){
        res.render('error/error404')
    }else{
        const param = req.params.shortUrl
        deleteUrl(param, 'biolinks')
        return res.status(200).send('success')
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

router.post('/addImg/:type/:shortId', multer.single("imgfile"), async(req, res)=>{
    try {
        if (req.file) {
            const type = req.params.type
            const shortId = req.params.shortId
            const img = 'https://storage.googleapis.com/url-shortener-storage/' + req.file.originalname
            const data = {
                oldShort: shortId,
                short: shortId,
                img,
                updatedAt: new Date()
            }
            if(type == 'url'){
                const result = await editURL(data).catch(console.dir);
            }else{

            }
            await uploadImage(req.file)
            res.status(200).send({img})


        } else throw "error with img";
    } catch (error) {
        res.status(500).send(error);
    }
})

router.delete('/deleteImg/:fileName', async(req, res)=>{
    const fileName = req.params.fileName
    deleteImage(fileName)
    return res.status(200).send('success')
})

export default router