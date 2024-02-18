import { GoogleGenerativeAI } from '@google/generative-ai'
import {customAlphabet , random} from 'nanoid'
import  { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore'
import '../config/firebase.js'
import 'dotenv/config'
import { searchData } from './universal.js'
import { bucket } from '../config/cloudStorage.js'

const db = getFirestore();
const dbName = 'shorturls'

const genAI = new GoogleGenerativeAI(process.env.gemini_api_key);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

export async function promptUrlRecommendation(url) { 

    const prompt = "Make 3 recommendation of short url for suffix only! for this url "+ url +" make the output only the suffix with 2 until 3 readable words seperated with dash mark and without slash mark, dont mind the main url, display in order using numbers"

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text
}

export async function getAllUrl() {
    var rawData
    var data = []
    try {
        rawData = await db.collection(dbName).get();
        rawData.forEach((doc) => {
            data.push(doc.data())
        });
    } catch (err) {
        console.log(err.stack);
    }
    return data
}

export async function getAllBioLink() {  
    var rawData
    var data = []
    try {
        rawData = await db.collection('biolinks').get();
        rawData.forEach((doc) => {
            data.push(doc.data())
        });
    } catch (err) {
        console.log(err.stack);
    }
    return data
}

export async function addNewURL(data) {
    var status = true
    try {
        // check apakah sudah used di db short urlnya
        if(await searchData(dbName, data.short)){
            // data ada kembar
            return false
        }else{
            //check type qr&biolink/bukan
            if(data.type  == 'qr' || data.short == undefined){
                var shortQrNew 
                do{
                    const idQr = customAlphabet ('1234567890abcdefghijklmopqrstuvwxyz', 8)
                    shortQrNew = idQr(8)
                    data.short = shortQrNew
                }while(await searchData(dbName, shortQrNew))
            }
            const res = await db.collection(dbName).doc(data.short).set(data)
            return true
        }
    } catch (err) {
        console.log(err.stack);
        return false
    }
}

export async function editURL(data) {
    var status = true
    try {
        // check edit is include with short url changes or not
        const editShortStatus = (data.oldShort != data.short)? true : false
        //edit includes short url changes
        var oldData = await searchData(dbName,data.oldShort)
        if(data.updatedAt) oldData.updatedAt = data.updatedAt
        if(data.full) oldData.full = data.full
        if(data.short) oldData.short = data.short
        if(data.title) oldData.title = data.title
        if(data.description) oldData.description = data.description
        if(data.img) oldData.img = data.img
        if(data.type) oldData.type = data.type
        if(data.bioLink) oldData.bioLink = data.bioLink
        if(editShortStatus){
            const del = await db.collection(dbName).doc(data.oldShort).delete()
        }
        const res = await db.collection(dbName).doc(data.short).set(oldData)
        
    } catch (err) {
        console.log(err.stack);
        return false
    }
    return status
}

export async function addNewBioLink(data) {
    var status = true
    try {
        if(await searchData('biolinks', data.short)){
            return false
        }else{
            const res = await db.collection('biolinks').doc(data.short).set(data)
            return true
        }
    } catch (err) {
        console.log(err.stack);
        return false
    }
}

export async function editBioLink(data) {
    var status = true
    try {
        // check edit is include with short url changes or not
        const editShortStatus = (data.oldShort != data.short)? true : false
        //edit includes short url changes
        var oldData = await searchData('biolinks',data.oldShort)
        if(data.updatedAt) oldData.updatedAt = data.updatedAt
        if(data.short) oldData.short = data.short
        if(data.title) oldData.title = data.title
        if(data.avatar) oldData.avatar = data.avatar
        if(data.background) oldData.background = data.background
        if(editShortStatus){
            const del = await db.collection('biolinks').doc(data.oldShort).delete()
        }
        const res = await db.collection('biolinks').doc(data.short).set(oldData)
        
    } catch (err) {
        console.log(err.stack);
        return false
    }
    return status
}

export async function deleteField(data) {  
    try{
        const ref = db.collection(data.collection).doc(data.short);
        const type = data.type
        if(type == 'background')await ref.update({background: FieldValue.delete()})
        if(type == 'avatar')await ref.update({avatar: FieldValue.delete()})
        if(type == 'img') await ref.update({img: FieldValue.delete()})
        return true
    }catch(err){
        console.log(err);
    }
    return false
}

export async function updateClickShortUrl(param) {
    var find
    try { 
        find = await searchData(dbName, param)
        find.clicks++
        const res = await db.collection(dbName).doc(param).set(find)
    } catch (err) {
        console.log(err.stack);
    }
}

export async function deleteUrl(param, colName){
    try{
        const res = await db.collection(colName).doc(param).delete()
    }catch(err){
        console.log(err.stack);
    }
}

export async function filterData(filter, data) {  
    var newData = []
    if(filter){
        var filterType = filter.type != undefined ? true : false 
        var filterBioLink = filter.bioLink != undefined ? true : false 
        if(filter.title == undefined) filter.title = ''
        for (const iterator of data) {
            var title = iterator.title + ""
            title = title.toLowerCase()
            if(title.includes(filter.title)){
                if(filterType){
                    if(filter.type != iterator.type){
                        continue
                    }
                }
                if(filterBioLink){
                    if(filter.bioLink != iterator.bioLink){
                        continue
                    }
                }
                newData.push(iterator)
            }
        }
    }
    return newData
}

export async function sortDataBioLink(data) {  
    var list =[]
    var youtubeList = []
    var linkList = []
    list = data.sort((a, b)=> {
        const titleA = a.title.toUpperCase()
        const titleB = b.title.toUpperCase();
        if (titleA < titleB) {
            return -1;
        }
        if (titleA > titleB) {
            return 1;
        }
        return 0;
    })
    for (const iterator of list) {
        if(iterator.type == 'youtube'){
            youtubeList.push(iterator)
        }else{
            linkList.push(iterator)
        }
    }
    return linkList.concat(youtubeList)
}

export async function uploadImage(file) {  
    console.log("File found, trying to upload...");
    try{
        const blob = bucket.file(file.originalname);
        const blobStream = blob.createWriteStream({
            resumable: false
        });
        
        blobStream.on("finish", () => {
            return true
        });
        blobStream.end(file.buffer);
    }catch(error){
        console.log(error);
    }
}

export async function deleteImage(fileName){
    new Promise((resolve, reject) => {
        //imageurl=parentfolder/childfolder/filename
        try{
            bucket.file(fileName).delete()
            .then((image) => {
                resolve(image)
            })
            .catch((e) => {
                reject(e)
            });
        }catch(error){
            console.log(error);
        }
        
        
    });
}