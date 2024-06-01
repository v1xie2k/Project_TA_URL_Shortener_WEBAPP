import  { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore'
import {customAlphabet , random} from 'nanoid'
import '../config/firebase.js'
import 'dotenv/config'
import { searchData } from './universal.js'
import { bucket } from '../config/cloudStorage.js'
import midtransPkg from 'midtrans-client';
import moment from 'moment/moment.js'
import nodemailer from 'nodemailer'
import excelJS from 'exceljs'

const db = getFirestore();
const midtransClient = midtransPkg
const dbName = "transactions"

export async function getAllPriceList() {
    var rawData
    var data = []
    try {
        rawData = await db.collection('services').get();
        rawData.forEach((doc) => {
            const obj = doc.data()
            obj.priceIdr =doc.data().price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")
            data.push(obj)
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
        snap.createTransaction(parameter).then((transaction) => {
            resolve(transaction.token)
        }).catch((err) => {
            reject(err)
        })
    });
}
const InvoiceStatus = [
    {
        id: 1,
        name: 'Pending'
    },
    {
        id: 2,
        name: 'Success'
    },
    {
        id: 3,
        name: 'Canceled'
    },
]
export async function createInvoice(data) {  
    try{
        var invoiceId 
        do{
            const generateInvoiceId = customAlphabet ('1234567890abcdefghijklmopqrstuvwxyz', 10)
            invoiceId = generateInvoiceId(10)
            data.invoiceId = invoiceId
            data.status = 1
            data.tokenExpire = moment().add({day: 1}).toDate()
        }while(await searchData(dbName, invoiceId))
        const parameter = {
            'transaction_details': {
                'order_id': invoiceId,
                'gross_amount': data.grandTotal,
            },
            "item_details": data.items
        }
        const token = await getToken(parameter)
        data.token = token
        const res = await db.collection(dbName).doc(invoiceId).set(data)
        const obj = {
            token,
            invoiceId
        }
        return obj
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
    return
    try{
        await db.collection(dbName).doc(invoiceId).delete()
        return false
    }catch(err){
        console.log(err);
    }
    return false
}

export async function addCreditToUser(email, planId) {  
    try{
        var oldData = await searchData('users', email)
        var plan = await searchData('plans', planId) ? await searchData('plans', planId) : planId
        if(plan.bio && plan.bio > 0){
            oldData.creditBioLink += parseInt(plan.bio)
        }
        if(plan.bioPro && plan.bioPro > 0){
            oldData.creditBioPro += parseInt(plan.bioPro)
        }
        if(plan.prompt && plan.prompt > 0){
            oldData.creditPrompt += parseInt(plan.prompt)
        }
        if(plan.qr && plan.qr > 0){
            oldData.creditQr += parseInt(plan.qr)
        }
        if(plan.url && plan.url > 0){
            oldData.creditShortUrl += parseInt(plan.url)
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
    var new_data
    async function formatObject(doc, filter, planId) {  
        doc.data().date = formatDate(doc.data().createdAt)
        const plan = await searchData('plans', planId)
        const obj = doc.data()
        obj.plan = obj.type == 'plan' ? plan.name : 'custom plan'
        obj.date = formatDate(doc.data().createdAt)
        obj.grandTotalIdr =doc.data().grandTotal.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")
        if(moment(obj.tokenExpire).isSameOrAfter(moment(), 'second')){
            obj.status = 3
        }
        if(filter){
            const dateCreated = moment(doc.data().createdAt).format('YYYY-MM-DD')
            if(filter.dateFrom && filter.dateTo){
                if(filter.dateFrom <= dateCreated && dateCreated <= filter.dateTo){
                    if(filter.status && filter.status != 0){
                        if(obj.status == filter.status){
                            return obj
                        }
                    }else{
                        if(filter.type == 0){
                            return obj
                        }else if(filter.type == 1){
                            if(obj.type == 'plan') return obj
                        }else if(filter.type == 2){
                            if(obj.type == 'customplan') return obj
                        }else{
                            return obj
                        }
                    }
                }
            }
        }else{
            return obj
        }
    }
    try {
        rawData = await db.collection('transactions').orderBy('createdAt', 'desc').get();
        const promises = [];
        rawData.forEach((doc) => {
            if(user && user == doc.data().user){
                promises.push(formatObject(doc, filter, doc.data().planId).then(formatObj => {
                    if(formatObj){
                        data.push(formatObj)
                        // console.log('data_push', data);
                    }
                }));
            }
            else if(!user && doc.data().user){
                promises.push(formatObject(doc, filter, doc.data().planId).then(formatObj => {
                    if(formatObj){
                        data.push(formatObj)
                    }
                }));
            }
        });
        await Promise.all(promises)
    } catch (err) {
        console.log(err.stack);
    }
    return data
}

export async function getInvoices(filter) {  
    var rawData, plans
    var data = []
    try {
        rawData = await db.collection('transactions').get();
        plans = await db.collection('plans').get()
        rawData.forEach((doc) => {
            if(doc.data().status == 2){
                doc.data().date = formatDate(doc.data().createdAt)
                const obj = doc.data()
                obj.date = formatDate(doc.data().createdAt)
                plans.forEach((plan)=>{
                    if(plan.data().planId == obj.planId) obj.plan = plan.data().name
                })
                if(filter){
                    const dateCreated = moment(doc.data().createdAt).format('YYYY-MM-DD')
                    if(filter.dateFrom && filter.dateTo){
                        if(filter.dateFrom <= dateCreated && dateCreated <= filter.dateTo  ){
                            if(filter.type && filter.type != 0){
                                if(filter.type == 1){
                                    if(obj.planId) data.push(obj)
                                }else if(filter.type == 2){
                                    if(obj.type == 'customplan') data.push(obj)
                                }
                            }else{
                                data.push(obj)
                            }
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

export async function getIncome(filter) {  
    var rawData
    var incomeData = []
    var totalIncome = 0 , planIncome = 0 , customIncome = 0
    var data = {}
    try{
        rawData = await db.collection('transactions').get()
        rawData.forEach((doc) => {
            if(doc.data().status == 2){
                if(filter){
                    const dateCreated = moment(doc.data().createdAt).format('YYYY-MM-DD')
                    if(filter.dateFrom && filter.dateTo){
                        if(filter.dateFrom <= dateCreated && dateCreated <= filter.dateTo  ){
                            totalIncome += parseInt(doc.data().grandTotal)
                            incomeData.push(doc.data())
                            if(doc.data().type == 'plan'){
                                planIncome += parseInt(doc.data().grandTotal)
                            }else{
                                customIncome += parseInt(doc.data().grandTotal)
                            }
                        }
                    }
                }else{
                    totalIncome += parseInt(doc.data().grandTotal)
                    incomeData.push(doc.data())
                    if(doc.data().type == 'plan'){
                        planIncome += parseInt(doc.data().grandTotal)
                    }else{
                        customIncome += parseInt(doc.data().grandTotal)
                    }
                }
            }
        })
        data.incomeData = incomeData
        data.totalIncome = totalIncome.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")
        data.customIncome = customIncome.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")
        data.planIncome = planIncome.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")
        if(filter.type == 1){
            data.totalIncome = data.planIncome
        }else if(filter.type == 2){
            data.totalIncome = data.customIncome
        }
        return data
    }catch (err) {
        console.log(err.stack);
    }
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
            obj.priceIdr =doc.data().price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")
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
        if(data.bioPro | data.bioPro == 0) oldData.bioPro = data.bioPro
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

export function sortPlans(data, sort) {  
    var list =[]
    list = data.sort((a, b)=> {
        const nameA = a.name.toUpperCase()
        const nameB = b.name.toUpperCase();
        const priceA = a.price
        const priceB = b.price
        if(sort == 'priceDesc'){
            if(priceA < priceB) return 1
            if(priceA > priceB) return -1
        }else if(sort == 'nameAsc'){
            if(nameA < nameB) return -1
            if(nameA > nameB) return 1

        }else if(sort == 'nameDesc'){
            if(nameA < nameB) return 1
            if(nameA > nameB) return -1
        }else{
            if(priceA < priceB) return -1
            if(priceA > priceB) return 1
        }
        return 0;
    })

    return list
}

export async function sendEmail(email, message, type) {
    var transporter = nodemailer.createTransport({
        host: 'live.smtp.mailtrap.io',
        port: 587,
        secure: false,
        auth: {
            user: 'api',
            pass: process.env.mailtrap_pass
        }
    });
    var subject
    if(type == 'notifPayment'){
        subject = 'Transaction Reminder'
    }else{
        subject = 'Canceled Payment'
    }
    let info = await transporter.sendMail({
        from: 'info@gamepal.my.id',
        to: email,
        subject,
        text: message
    })
}

export async function exportTransactions(data, response) {  
    const workbook = new excelJS.Workbook()
    const worksheet = workbook.addWorksheet('Transaction Report')
    worksheet.columns = [
        { header: "No", key: "no", width: 10 }, 
        { header: "Tanggal", key: "tanggal", width: 10 },
        { header: "User", key: "user", width: 10 },
        { header: "Keterangan", key: "keterangan", width: 10 },
        { header: "Tipe", key: "type", width: 10 },
        { header: "Pemasukan", key: "income", width: 10 },
    ];
    let counter = 1;
    data.transactions.forEach((item) => {
        const obj = {}
        obj.no = counter 
        obj.tanggal = item.createdAt 
        obj.user = item.user
        obj.keterangan = item.type == 'customplan' ? 'Pembelian Custom Plan' : 'Pembelian Plan '+ item.plan
        obj.type = item.type
        obj.income = 'Rp' + item.grandTotalIdr
        if(item.status == 2){
            worksheet.addRow(obj)
            counter++
        }
    })

    worksheet.getRow(1).eachCell((cell)=>{
        cell.font = { bold : true }
    })
    worksheet.addRow({keterangan: 'Total', income: 'Rp'+data.totalIncome })
    worksheet.getRow(counter+1).eachCell((cell)=>{
        cell.font = { bold : true }
    })

    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader('Content-Disposition', 'attachment; filename="transaction.xlsx"')
    workbook.xlsx.write(response).then(function(){
        response.end();
        console.log('Done!');
    })
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

