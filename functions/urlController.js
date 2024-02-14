import { GoogleGenerativeAI } from '@google/generative-ai'
import {customAlphabet , random} from 'nanoid'
import  { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore'
import '../config/firebase.js'
import 'dotenv/config'

const db = getFirestore();
const dbName = 'shorturls'

const genAI = new GoogleGenerativeAI(process.env.gemini_api_key);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});
//done
export async function getAllUrl() {
    var rawData
    var data = []
    try {
        rawData = await db.collection(dbName).get();
        rawData.forEach((doc) => {
            data.push(doc.data())
        });
        // //tes gemini
        // //url tingal diganti dengan long url yang mau dipakai
        // const prompt = "Make 3 recommendation of short url for suffix only! this url   make the output only the suffix with 2 until 3 readable words seperated with dash mark and without slash mark, dont mind the main url"

        // const result = await model.generateContent(prompt);
        // const response = await result.response;
        // const text = response.text();
        // console.log(text);
    } catch (err) {
        console.log(err.stack);
    }
    return data
}

export async function filterData(filter, data) {  
    var newData = []
    if(filter){
        for (const iterator of data) {
            if(filter.type == iterator.type){
                newData.push(iterator)
            }
        }
    }
    return newData
}

export async function addNewURL(data) {
    var status = true
    try {
        // check apakah sudah used di db short urlnya
        if(await searchShortUrl(data.short)){
            // data ada kembar
            status = false 
        }else{
            //check type qr/bukan
            if(data.type  == 'qr' && data.short.length <= 0){
                var shortQrNew 
                do{
                    const idQr = customAlphabet ('1234567890abcdefghijklmopqrstuvwxyz', 8)
                    shortQrNew = idQr(8)
                    data.short = shortQrNew
                }while(await searchShortUrl(shortQrNew))
            }
            const res = await db.collection(dbName).doc(data.short).set(data)
            return true
        }
    } catch (err) {
        console.log(err.stack);
        return false
    }
    return status
}

export async function searchShortUrl(param) {
    var find
    try {
        if(param){
            find = await(await db.collection(dbName).doc(param).get()).data();
        }
    } catch (err) {
        console.log(err.stack);
    }
    return find
}

export async function updateClickShortUrl(param) {
    var find
    try { 
        find = await searchShortUrl(param)
        find.clicks++
        const res = await db.collection(dbName).doc(param).set(find)
    } catch (err) {
        console.log(err.stack);
    }
}

export async function generateCode(data) {
    
}