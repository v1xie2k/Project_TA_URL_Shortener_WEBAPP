import { MongoClient, ServerApiVersion } from 'mongodb';
import qrcode from 'qrcode';
import {customAlphabet , random} from 'nanoid'
import Swal from 'sweetalert2'
import mongoose from 'mongoose';
import {fire} from '../config/firebase.js'
import  { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore'

// const dbName = "url";
// const uri = "mongodb+srv://peko:pekopeko666@cluster0.no79huv.mongodb.net/url";
// const conn = await mongoose.connect(uri);
// const db = conn.connection;

// const ShortUrl = db.collection('shorturl')

// const db = getFirestore(fire)
const db = getFirestore();
const dbName = 'shorturls'

// export async function checkUrl(url) {  
//     var status = false
//     var rawData
//     try{
//         rawData = await db.collection(dbName).get();
//         rawData.forEach((doc) => {
//             if(doc.data().short == url){
//                 status = true
//             }
//         });
//     } catch(err){
//         console.log(err.stack);
//     }
//     console.log(status);
//     return status
// }

//done
export async function getAllUrl() {
    var rawData
    var data = []
    try {
        // data = await ShortUrl.find({}).toArray();
        rawData = await db.collection(dbName).get();
        rawData.forEach((doc) => {
            data.push(doc.data())
        });
    } catch (err) {
        console.log(err.stack);
    }
    return await data
}

export async function addNewURL(data) {
    var status = true
    
    try {
        // check apakah sudah used di db short urlnya
        console.log('why!S');
        if(await searchShortUrl(data.short)){
                console.log('1');
                // data ada kembar
                status = false 
            }else{
                console.log('2');
                //check type qr/bukan
                console.log(data);
                if(data.type  == 'qr' && data.short.length <= 0){
                    var shortQrNew 
                    do{
                        const idQr = customAlphabet ('1234567890abcdefghijklmopqrstuvwxyz', 8)
                        shortQrNew = idQr(8)
                        data.short = shortQrNew
                    }while(await searchShortUrl(shortQrNew))
                    // data.qr_code = await qrcode.toDataURL(shortQrNew, async (err, src) => {
                    //     return await src
                    // });
                    // await qrcode.toDataURL(shortQrNew, async (err, src) => {
                    //     data.qr = src
                    // });
                }
                // const p = await ShortUrl.insertOne(data);
                const res = await db.collection(dbName).doc(data.short).set(data)
                console.log(res);
                return true
            }
        } catch (err) {
            console.log(err.stack);
            return false
     }
    return status
}

//done
export async function searchShortUrl(param) {
    var find
    try {
        find = await(await db.collection(dbName).doc(param).get()).data();
    } catch (err) {
        console.log(err.stack);
    }
    return find
}

export async function updateClickShortUrl(param) {
    var find, rawData
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