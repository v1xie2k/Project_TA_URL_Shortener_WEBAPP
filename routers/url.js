import express from 'express'
import { addNewBioLink, addNewURL, deleteField, deleteImage, deleteUrl, editBioLink, editURL, getAllUrl, promptUrlRecommendation, uploadImage } from '../functions/urlController.js';
import { searchData } from '../functions/universal.js';
import session from 'express-session'
import axios from 'axios'
import Multer from 'multer'
import 'dotenv/config'
import { bucket } from '../config/cloudStorage.js';
import { edituser } from '../functions/userController.js';
import { addCreditToUser, createInvoice, deleteInvoice, getToken, updateInvoice, updateService } from '../functions/planController.js';

const router = express.Router()

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
      fileSize: 3.5 * 1024 * 1024, // No larger than 3.5mb, change as you need
    },
});

router.post('/url', async(req, res)=>{
    const data = req.body
    try{
        data.createdBy = req.session.user.email
        const result = await addNewURL(data).catch(console.dir)
        if(result){
            return res.status(200).send(result)
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
        data.createdBy = req.session.user.email
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

router.post('/biolink/edit', async(req, res)=>{
    const data = req.body
    try{
        const result = await editBioLink(data).catch(console.dir);
        if(result){
            const allUrl = await getAllUrl()
            const bioLink = data.oldShort
            for (const iterator of allUrl) {
                if(iterator.bioLink == bioLink){
                    await editURL({short: iterator.short, oldShort: iterator.short, bioLink: data.short, updatedAt: data.updatedAt}).catch(console.dir)
                }
            }
            return res.status(200).send('success')
        }
        else{
            return res.status(400).send('error')
        }
    }catch(err){
        return res.status(400).send(err)
    }
})

router.post('/biolink/check', async(req, res)=>{
    const short = req.body.short
    if(await searchData('biolinks', short)){
        return res.status(400).send('error')
    }else{
        return res.status(200).send('success')
    }
})

router.post('/deleteField', async(req, res)=>{
    const data = req.body
    try{
        if(data.type == 'profile') req.session.user.profile = null
        const result = await deleteField(data).catch(console.dir);
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

router.post('/getYoutubeInfo', async(req, res)=>{
    const api_key = process.env.gcp_service_api_key
    const body = req.body
    const videoId = req.body.youtubeId
    var result
    try{
        axios.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + api_key).then(async response => {
            return res.status(200).send({result: response.data})
        }).catch(error => {
            console.log(error);
            return res.status(400).send('failed')
        })
    }catch(err){
        console.log(err);
    }
})

router.delete('/delete_bio_link/:bioLinkUrl', async(req, res)=>{
    const bioLinkUrl = await searchData('biolinks', req.params.bioLinkUrl)
    if(bioLinkUrl == null){
        res.render('error/error404')
    }else{
        const param = req.params.bioLinkUrl
        const allUrl = await getAllUrl()
        try{
            for (const iterator of allUrl) {
                if(iterator.bioLink == param){
                    await deleteUrl(iterator.short, 'shorturls')
                    if(iterator.img){
                        const imgName = iterator.img.split('/')[4]
                        await deleteImage(imgName)
                    } 
                }
            }
            if(bioLinkUrl.blocks){
                for (const block of bioLinkUrl.blocks){
                    if(block.type =='slider'){
                        for (const imgData of block.data) {
                            const imgName = imgData.img.split('/')[4]
                            await deleteImage(imgName)
                        }
                    }
                }
            }
            await deleteUrl(param, 'biolinks')
        }catch(err){
            console.log(err);
        }
        return res.status(200).send('success')
    }
})

router.post('/prompt', async(req, res)=>{
    const full = req.body.full
    const title = req.body.title
    try{
        const promptResult = await promptUrlRecommendation(full, title);
        if(promptResult){
            const shortURL = await getAllUrl()
            const list = promptResult.split("\n")
            const filteredList = []
            // console.log(list);
            for (const iterator of list) {
                var val = iterator.split(".")
                val = val[1].trim()
                var status = false
                for (const shorts of shortURL) {
                    if(shorts.short == val)status = true
                }
                // console.log('val',val)
                if(!status) filteredList.push(val)
            }
            
            // console.log('filteredList', filteredList);
            return res.status(200).send({promptResult: filteredList})
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
            const template = 'https://storage.googleapis.com/url-shortener-storage-2/'
            const type = req.params.type
            const shortId = req.params.shortId
            const img = template + req.file.originalname
            const data = {
                oldShort: shortId,
                short: shortId,
                updatedAt: new Date()
            }
            if(type == 'url'){
                data.img = img
                await editURL(data).catch(console.dir);
            }else if(type == 'background'){
                data.background = img
                await editBioLink(data).catch(console.dir)
            }else if(type == 'avatar'){
                data.avatar = img
                await editBioLink(data).catch(console.dir)
            }else if(type == 'user'){
                data.profile = img 
                data.email = shortId
                req.session.user.profile = img
                await edituser(data).catch(console.dir)
            }

            await uploadImage(req.file)
            res.status(200).send(img)

        } else throw "error with img";
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/addImgSlider/:type/:biolinkId/:idBlock/:idImage', multer.single("imgfile"), async(req, res)=>{
    try {
        if (req.file) {
            const template = 'https://storage.googleapis.com/url-shortener-storage-2/'
            const type = req.params.type
            const idBlock = req.params.idBlock
            const idImage = req.params.idImage
            const biolinkId = req.params.biolinkId
            const img = template + req.file.originalname
            const data = {
                oldShort: biolinkId,
                short: biolinkId,
                updatedAt: new Date()
            }
            const biolink = await searchData('biolinks', biolinkId)
            
            if(type == 'add'){
                const date = new Date().toString()
                const sliderData = {img, createdAt: date}
                var blockData = []
                for (const block of biolink.blocks) {
                    if(block.createdAt == idBlock){
                        blockData = block.data 
                        blockData.push(sliderData)
                        block.data = blockData
                    } 
                }
                const bioData = {oldShort : biolinkId, short: biolinkId, blocks: biolink.blocks }
                await editBioLink(bioData).catch(console.dir)
            }else if(type == 'update'){
                await deleteImage(idImage)
                for (const block of biolink.blocks) {
                    if(block.createdAt == idBlock){
                        block.data = block.data.filter((x) => {
                            if(x.img.includes(idImage)){
                                x.img = img
                            }
                            return x
                        })
                    } 
                }
                const bioData = {oldShort : biolinkId, short: biolinkId, blocks: biolink.blocks }
                console.log(bioData);
                await editBioLink(bioData).catch(console.dir)
            }
            await uploadImage(req.file)
            console.log('success Add');
            res.status(200).send(img)

        } else throw "error with img";
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/addCollector/', async(req, res)=>{
    //update data untuk collector phone maupun email (di front tingal fetch saja)
    try {
        if (req.body) {
            const body = req.body
            const type = body.type
            const idCollector = body.idCollector
            const biolinkId = body.biolinkId
            const biolink = await searchData('biolinks', biolinkId)
            var blockData 
            if(type == 'email'){
                for (const block of biolink.blocks) {
                    if(block.idCollector == idCollector){
                        blockData = block.data
                        blockData.push({name: body.name, email: body.email, createdAt: new Date()})
                        block.data = blockData
                    } 
                }
            }else if(type == 'phone'){
                for (const block of biolink.blocks) {
                    if(block.idCollector == idCollector){
                        blockData = block.data
                        blockData.push({name: body.name, phone: body.phone, createdAt: new Date()})
                        block.data = blockData
                    } 
                }
            }
            const bioData = {oldShort : biolinkId, short: biolinkId, blocks: biolink.blocks }
            await editBioLink(bioData).catch(console.dir)
            res.status(200).send('success')

        } else throw "error with img";
    } catch (error) {
        res.status(500).send(error);
    }
})

router.delete('/deleteImg/:fileName', async(req, res)=>{
    const fileName = req.params.fileName
    try{
        await deleteImage(fileName)
        res.status(200).send('success delete')
    }catch(error){
        res.status(500).send(error);
    }
})

router.post('/addPdf', multer.single("file"), async(req, res)=>{
    try {
        if (req.file) {
            const template = 'https://storage.googleapis.com/url-shortener-storage-2/'
            const img = template + req.file.originalname
            
            await uploadImage(req.file)
            res.status(200).send(img)

        } else throw "error with img";
    } catch (error) {
        res.status(500).send(error);
    }
})

export default router