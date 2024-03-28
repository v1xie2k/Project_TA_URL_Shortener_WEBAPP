import { GoogleGenerativeAI } from '@google/generative-ai'
import {customAlphabet , random} from 'nanoid'
import  { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore'
import '../config/firebase.js'
import 'dotenv/config'
import { searchData } from './universal.js'
import { bucket } from '../config/cloudStorage.js'
import moment from 'moment'
import { UAParser } from 'ua-parser-js';

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

export async function getAllShortUrl() {
    var rawData
    var data = []
    try {
        rawData = await db.collection(dbName).get();
        rawData.forEach((doc) => {
            if(doc.data().type != 'qr' || !doc.data().type) data.push(doc.data())
        });
    } catch (err) {
        console.log(err.stack);
    }
    return data
}

export async function getAllQr() {
    var rawData
    var data = []
    try {
        rawData = await db.collection(dbName).get();
        rawData.forEach((doc) => {
            if(doc.data().type == 'qr') data.push(doc.data())
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
            const obj = doc.data()
            obj.updateDate = moment(doc.data().updatedAt).format('ll')
            obj.createdDate = moment(doc.data().createdAt).format('ll')
            data.push(obj)
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
            if(data.type  == 'qr' && data.short == undefined){
                var shortQrNew 
                do{
                    const idQr = customAlphabet ('1234567890abcdefghijklmopqrstuvwxyz', 8)
                    shortQrNew = idQr(8)
                    data.short = shortQrNew
                }while(await searchData(dbName, shortQrNew))
            }else if(data.short == undefined){
                var shortQrNew 
                do{
                    const idQr = customAlphabet ('1234567890abcdefghijklmopqrstuvwxyz', 8)
                    shortQrNew = idQr(8)
                    data.short = shortQrNew
                }while(await searchData(dbName, shortQrNew))
            }
            // console.log('data', data);
            const res = await db.collection(dbName).doc(data.short).set(data)
            // console.log(res);
            return data
        }
    } catch (err) {
        console.log(err.stack);
        return false
    }
}

export async function editURL(data) {
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
        if(data.youtubeId) oldData.youtubeId = data.youtubeId
        if(editShortStatus){
            const del = await db.collection(dbName).doc(data.oldShort).delete()
        }
        const res = await db.collection(dbName).doc(data.short).set(oldData)
        return true
    } catch (err) {
        console.log(err.stack);
        return false
    }
}

export async function addNewBioLink(data) {
    var status = true
    try {
        if(await searchData('biolinks', data.short)){
            return false
        }else{
            data.type = 'biolink'
            data.pro = false
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
        if(data.pageTitle) oldData.pageTitle = data.pageTitle
        if(data.pageDescription) oldData.pageDescription = data.pageDescription
        if(data.instagram) oldData.instagram = data.instagram
        if(data.facebook) oldData.facebook = data.facebook
        if(data.youtube) oldData.youtube = data.youtube
        if(data.blocks) oldData.blocks = data.blocks
        if(data.pro) oldData.pro = data.pro
        if(data.styleTemplate) oldData.styleTemplate = data.styleTemplate
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
        if(type == 'profile') await ref.update({profile: FieldValue.delete()})
        if(data.deletePageTitle) await ref.update({pageTitle: FieldValue.delete()})
        if(data.deletePageDescription) await ref.update({pageDescription: FieldValue.delete()})
        if(data.deleteInstagram) await ref.update({instagram: FieldValue.delete()})
        if(data.deleteFacebook) await ref.update({facebook: FieldValue.delete()})
        if(data.deleteYoutube) await ref.update({youtube: FieldValue.delete()})
        return true
    }catch(err){
        console.log(err);
    }
    return false
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
                if(filter.public){
                    newData.push(iterator)
                }else{
                    if(filter.user == iterator.createdBy){
                        newData.push(iterator)
                    }
                }
                
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

export async function sortBlocksBioLink(data) {  
    var list =[]
    list = data.blocks.sort((a, b)=> {
        const orderA = a.order
        const orderB = b.order;
        if (orderA < orderB) {
            return -1;
        }
        if (orderA > orderB) {
            return 1;
        }
        return 0;
    })
    return list
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
    new Promise(async (resolve, reject) => {
        //imageurl=parentfolder/childfolder/filename
        try{
            if(await bucket.file(fileName).exists() == true){
                console.log('naze?');
                console.log(await bucket.file(fileName).exists());
                bucket.file(fileName).delete()
                .then((image) => {
                    resolve(image)
                })
                .catch((e) => {
                    reject(e)
                });
            }
            return
        }catch(error){
            console.log(error);
        }
        
        
    });
}

export async function updateClickShortUrl(collection, param, userAgent, country, referer) {
    var data
    try { 
        const parser = new UAParser(userAgent);
        let parserResults = parser.getResult();
        const device = parserResults.device
        
        data = await searchData(collection, param)
        const logData = data.logClicks
        const now = moment().format('l'); 
        if(!device.type) device.type = 'desktop'
        const bodyData = {date: now, click: 1}
        if(logData){
            var status = true
            var statusCountry = true
            for (const iterator of logData) {
                if(iterator.date == now){
                    status = false
                    iterator.click += 1
                    for (const countryData of iterator.countryList) {
                        if(countryData.country == country){
                            statusCountry = false 
                            countryData.click += 1
                        }
                    }
                    for (const deviceData of iterator.device) {
                        if(deviceData.type == device.type) deviceData.click += 1
                    }
                    if(statusCountry){
                        iterator.countryList.push({country, click: 1})
                    }
                }
            }
            if(status){
                bodyData.device = [{type: 'mobile', click: 0}, {type: 'tablet', click: 0}, {type: 'desktop', click: 0}]
                for (const iterator of bodyData.device) {
                    if(iterator.type == device.type) iterator.click += 1
                }
                bodyData.countryList = [{country, click: 1}]
                data.logClicks.push(bodyData)
            }
        }else{
            bodyData.device = [{type: 'mobile', click: 0}, {type: 'tablet', click: 0}, {type: 'desktop', click: 0}]
            for (const iterator of bodyData.device) {
                if(iterator.type == device.type) iterator.click += 1
            }
            bodyData.countryList = [{country, click: 1}]
            data.logClicks = [bodyData]
        }
        data.clicks += 1
        const referrerData = data.referrer ? data.referrer : [] 
        if(referer){
            var refFound = false
            for (const ref of referrerData) {
                if(ref.referrer == referer){
                    ref.click = ref.click + 1
                    refFound = true
                }
            }
            if(!refFound){
                referrerData.push({referrer: referer, click: 1})
            }
        }else{
            var refFound = false
            for (const ref of referrerData) {
                if(ref.referrer == 'No Referer'){
                    ref.click = ref.click + 1
                    refFound = true
                }
            }
            if(!refFound){
                referrerData.push({referrer: 'No Referer', click: 1})
            }
        }
        data.referrer = referrerData
        const res = await db.collection(collection).doc(param).set(data)
    } catch (err) {
        console.log(err.stack);
    }
}

export async function getReports(email) {  
    var list = {}
    var data = []
    const allUrl = await filterData({user: email}, await getAllUrl())
    const allBioLink = await filterData({user: email}, await getAllBioLink())
    for (let index = 0; index < allUrl.length; index++) {
        if(allUrl[index].logClicks){
            for (const object of allUrl[index].logClicks) {
                allUrl[index].type ? object.type = 'qr' : object.type = 'url'
                data.push(object)
            }
        }
    }
    for (let index = 0; index < allBioLink.length; index++) {
        if(allBioLink[index].logClicks){
            for (const object of allBioLink[index].logClicks) {
                object.type = 'biolink'
                data.push(object)
            }
        }
    }

    const groupedData = {url:[], qr:[], biolink:[]};
  
    // Step 1: Group by type
    data.forEach(item => {
      // Initialize array for each type if it doesn't exist
      groupedData[item.type] = groupedData[item.type] || [];
  
      // Push the item to its corresponding type array
      groupedData[item.type].push(item);
    });
  
    // Step 2 and 3: Group by date and summarize clicks for each type
    Object.keys(groupedData).forEach(type => {
      const typeData = groupedData[type];
      const groupedByDate = {};
  
      typeData.forEach(item => {
        const date = item.date;
  
        // Initialize object for each date if it doesn't exist
        groupedByDate[date] = groupedByDate[date] || {
          date: date,
          totalClicks: 0,
          deviceClicks: [{type: 'mobile' , click: 0},{type: 'tablet' , click: 0},{type: 'desktop' , click: 0}],
          countryClicks: []
        };
  
        // Summarize clicks for each date
        groupedByDate[date].totalClicks += item.click;
  
        item.device.forEach(device => {
            for (const iterator of groupedByDate[date].deviceClicks) {
                if(device.type == iterator.type){
                    iterator.click += device.click
                }
            }
        });
  
        if (item.countryList) {
            item.countryList.forEach(country => {
                var found = false
                for (const iterator of groupedByDate[date].countryClicks) {
                    if(iterator.country == country.country){
                        iterator.click += country.click
                        found = true
                    }
                }
                if(!found){
                    const countryName = country.country
                    const countryClick = country.click
                    groupedByDate[date].countryClicks.push({country: countryName, click: countryClick})
                }
            });
        }
      });
  
      // Convert object to array of grouped data for each type
      groupedData[type] = Object.values(groupedByDate);
    });
    return groupedData
}
