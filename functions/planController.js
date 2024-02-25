import  { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore'
import {customAlphabet , random} from 'nanoid'
import '../config/firebase.js'
import 'dotenv/config'
import { searchData } from './universal.js'
import { bucket } from '../config/cloudStorage.js'
import midtransPkg from 'midtrans-client';
import moment from 'moment/moment.js'


const db = getFirestore();
const midtransClient = midtransPkg
const dbName = "transactions"

export async function getAllPriceList() {
    var rawData
    var data = []
    try {
        rawData = await db.collection('services').get();
        rawData.forEach((doc) => {
            data.push(doc.data())
        });
    } catch (err) {
        console.log(err.stack);
    }
    return data
}

export async function getToken(parameter) {  
    const midtransClientKey = process.env.midtrans_client_key
    const midtransServerKey = process.env.midtrans_server_key
    return new Promise(function (resolve, reject) {
        let snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: midtransServerKey,
            clientKey: midtransClientKey
        });
        console.log(parameter);
        snap.createTransaction(parameter).then((transaction) => {
            console.log('token', transaction.token)
            resolve(transaction.token)
        }).catch((err) => {
            reject(err)
        })
    });
}

export async function createInvoice(data) {  
    try{
        var invoiceId 
        do{
            const generateInvoiceId = customAlphabet ('1234567890abcdefghijklmopqrstuvwxyz', 10)
            invoiceId = generateInvoiceId(10)
            data.invoiceId = invoiceId
        }while(await searchData(dbName, invoiceId))
        const res = await db.collection(dbName).doc(invoiceId).set(data)
        return invoiceId
    }catch(err){
        console.log(err);
    }
    return false
}

export async function updateInvoice(invoiceId, data) {  
    try{
        var oldData = await searchData(dbName, invoiceId)
        if(oldData)
        {
            if(data.status) oldData.status = data.status
            if(data.token) oldData.token = data.token
            await db.collection(dbName).doc(invoiceId).set(oldData)
            return true  
        }
        return false 
    }catch(err){
        console.log(err);
    }
    return false
}

export async function deleteInvoice(invoiceId) {  
    try{
        await db.collection(dbName).doc(invoiceId).delete()
        return false
    }catch(err){
        console.log(err);
    }
    return false
}

export async function addCreditToUser(email, items) {  
    try{
        var oldData = await searchData('users', email)
        for (const iterator of items) {
            if(iterator.type == 'bio'){
                oldData.creditBioLink += parseInt(iterator.quantity)
            }else if(iterator.type == 'qr'){
                oldData.creditQr += parseInt(iterator.quantity)
            }else if(iterator.type == 'url'){
                oldData.creditShortUrl += parseInt(iterator.quantity)
            }else if(iterator.type == 'prompt'){
                oldData.creditPrompt += parseInt(iterator.quantity)
            }
        }
        await db.collection('users').doc(email).set(oldData)
        return false
    }catch(err){
        console.log(err);
    }
    return false
}

export async function getAllInvoice(user, filter) {  
    var rawData
    var data = []
    try {
        rawData = await db.collection('transactions').get();
        rawData.forEach((doc) => {
            if(user == doc.data().user && doc.data().status == 2){
                doc.data().date = formatDate(doc.data().createdAt)
                const obj = doc.data()
                obj.date = formatDate(doc.data().createdAt)
                if(filter){
                    const dateCreated = moment(doc.data().createdAt).format('YYYY-MM-DD')
                    if(filter.dateFrom && filter.dateTo){
                        if(filter.dateFrom <= dateCreated && dateCreated <= filter.dateTo  ){
                            data.push(obj)
                        }
                    }
                }else{
                    data.push(obj)
                }
            }
        });
    } catch (err) {
        console.log(err.stack);
    }
    return data
}

export async function updateService(data) {  
    try{
        var oldData = await searchData('services', data.service)
        if(data.price) oldData.price = data.price
        if(data.description) oldData.description = data.description
        await db.collection('services').doc(data.service).set(oldData)
        return false
    }catch(err){
        console.log(err);
    }
    return false
}

export async function getAllPlans() {
    var rawData
    var data = []
    try {
        rawData = await db.collection('plans').get();
        rawData.forEach((doc) => {
            doc.data().date = formatDate(doc.data().createdAt)
            const obj = doc.data()
            obj.date = formatDate(doc.data().createdAt)
            data.push(obj)
        });
    } catch (err) {
        console.log(err.stack);
    }
    return data
}

export async function addPlan(data) {  
    try{
        var planId 
        do{
            const generateplanId = customAlphabet ('1234567890abcdefghijklmopqrstuvwxyz', 10)
            planId = generateplanId(10)
            data.planId = planId
        }while(await searchData('plans', planId))
        const res = await db.collection('plans').doc(planId).set(data)
        return planId
    }catch(err){
        console.log(err);
    }
    return false
}

export async function editPlan(data) {  
    try{
        var oldData = await searchData('plans', data.planId)
        if(data.price) oldData.price = data.price
        if(data.name) oldData.name = data.name
        if(data.url || data.url == 0) oldData.url = data.url
        if(data.qr | data.qr == 0) oldData.qr = data.qr
        if(data.prompt | data.prompt == 0) oldData.prompt = data.prompt
        if(data.bio | data.bio == 0) oldData.bio = data.bio
        if(data.updatedAt) oldData.updatedAt = data.updatedAt
        await db.collection('plans').doc(data.planId).set(oldData)
        return false
    }catch(err){
        console.log(err);
    }
    return false
}

export async function deletePlan(planId) {  
    try{
        await db.collection('plans').doc(planId).delete()
        return false
    }catch(err){
        console.log(err);
    }
    return false
}


function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true 
    };
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', options);
    return formattedDate;
}