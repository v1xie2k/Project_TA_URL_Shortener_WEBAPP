import express from 'express'
import { searchData } from '../functions/universal.js';
import session from 'express-session'
import 'dotenv/config'
import { bucket } from '../config/cloudStorage.js';
import { addCreditToUser, addPlan, createInvoice, deleteInvoice, deletePlan, editPlan, getToken, sendEmail, updateInvoice, updateService } from '../functions/planController.js';
import midtransClient from 'midtrans-client';

const router = express.Router()

router.post('/getToken', async(req, res)=>{
    const parameter = req.body
    try{
        const token = await getToken(parameter)
        res.status(200).send(await token)
    }catch(error){
        res.status(500).send(error);
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
        await addCreditToUser(req.session.user.email, data.planId)
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

router.post('/midtrans', async(req, res)=>{
    try{
        let apiClient = new midtransClient.Snap({
            isProduction : false,
            serverKey : process.env.midtrans_server_key,
            clientKey : process.env.midtrans_client_key
        });
            let receivedJson = req.body;
          apiClient.transaction.notification(receivedJson)
          .then(async (statusResponse)=>{
                let orderId = statusResponse.order_id;
                let transactionStatus = statusResponse.transaction_status;
                let fraudStatus = statusResponse.fraud_status;
        
                console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);
                const invoice = await searchData('transactions', orderId)
                var planData = {bio: 0, bioPro: 0, prompt: 0, qr: 0, url: 0}
                if(invoice.items){
                    invoice.items.forEach(item =>{
                        if(item.type == 'bio') planData.bio = item.quantity
                        if(item.type == 'bioPro') planData.bioPro = item.quantity
                        if(item.type == 'prompt') planData.prompt = item.quantity
                        if(item.type == 'qr') planData.qr = item.quantity
                        if(item.type == 'url') planData.url = item.quantity
                    })
                }
                if (transactionStatus == 'capture'){
                    if (fraudStatus == 'accept'){
                        await updateInvoice(orderId, {status: 2})
                        if(invoice.type == 'customplan'){
                            await addCreditToUser(invoice.user, planData)
                        }else{
                            await addCreditToUser(invoice.user, invoice.planId)
                        }
                    }
                }else if (transactionStatus == 'settlement'){
                    await updateInvoice(orderId, {status: 2})
                    if(invoice.type == 'customplan'){
                        await addCreditToUser(invoice.user, planData)
                    }else{
                        await addCreditToUser(invoice.user, invoice.planId)
                    }
                }else if (transactionStatus == 'cancel' ||
                    transactionStatus == 'deny' ||
                    transactionStatus == 'expire'){
                    await updateInvoice(orderId, {status: 3})
                }else if (transactionStatus == 'pending'){
                    await updateInvoice(orderId, {status: 1})
                }
          });
          
        res.status(200).send('success')
    }catch(err){
        res.status(500).send(err)
    }
})

router.post('/sendEmail', async(req, res)=>{
    try{
        const data = req.body 
        await sendEmail(data.email, data.message, data.type)
        res.status(200).send('success')
    }catch(err){
        res.status(500).send(err)
    }
})

export default router