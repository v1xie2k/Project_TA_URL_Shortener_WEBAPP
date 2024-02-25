import express from 'express'
import { searchData } from '../functions/universal.js';
import session from 'express-session'
import 'dotenv/config'
import { bucket } from '../config/cloudStorage.js';
import { addCreditToUser, addPlan, createInvoice, deleteInvoice, deletePlan, editPlan, getToken, updateInvoice, updateService } from '../functions/planController.js';

const router = express.Router()

router.post('/getToken', async(req, res)=>{
    const parameter = req.body
    try{
        const token = await getToken(parameter)
        res.status(200).send(await token)
    }catch(error){
        res.status(500).send(error)
    }
})

router.post('/createInvoice', async(req, res)=>{
    const body = req.body
    try{
        body.user = req.session.user.email
        const invoiceId = await createInvoice(body)
        res.status(200).send(invoiceId)
    }catch(err){
        res.status(500).send(err)
    }
})

router.post('/updateInvoice/:invoiceId', async(req, res)=>{
    try{
        const invoiceId = req.params.invoiceId
        const data = req.body
        await updateInvoice(invoiceId, data)
        await addCreditToUser(req.session.user.email, data.items)
        res.status(200).send('success')
    }catch(err){
        res.status(500).send(err)
    }
})

router.delete('/deleteInvoice/:invoiceId', async(req, res)=>{
    try{
        const invoiceId = req.params.invoiceId
        const resp = await deleteInvoice(invoiceId)
        res.status(200).send('success')
    }catch(err){
        res.status(500).send(err)
    }
})

router.post('/updateService', async(req, res)=>{
    try{
        const data = req.body 
        await updateService(data)
        res.status(200).send('success')
    }catch(err){
        res.status(500).send(err)
    }
})

router.post('/addPlan', async(req, res)=>{
    try{
        const data = req.body 
        await addPlan(data)
        res.status(200).send('success')
    }catch(err){
        res.status(500).send(err)
    }
})

router.post('/editPlan', async(req, res)=>{
    try{
        const data = req.body 
        await editPlan(data)
        res.status(200).send('success')
    }catch(err){
        res.status(500).send(err)
    }
})


router.delete('/deletePlan/:planId', async(req, res)=>{
    try{
        const planId = req.params.planId 
        await deletePlan(planId)
        res.status(200).send('success')
    }catch(err){
        res.status(500).send(err)
    }
})

export default router