import  { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore'
import '../config/firebase.js'
import 'dotenv/config'

const db = getFirestore();

export async function searchData(dbName, param) {
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

export async function fetchAPI(apiUrl, method, data, text){
    var config = {method, headers: {"Content-Type": "application/json"}}
    if(data){
        config.body = JSON.stringify(data)
    }
    fetch(apiUrl, config).then(async (response) => {
        if (response.ok) {
            window.location.href = "/qr";
        }
        else if(response.status){
            Swal.fire({
            icon: "error",
            title: "Ooops....",
            text,
            });
        }
        else{
        }
    }).catch((error) => {
        alert('WARNING!')
        console.log(error);
    });
}

export async function checkCredit(data) {  
    const {type, email} = data
    var status = false
    var rawData =  await(await db.collection('users').doc(email).get()).data()
    if(type == 'qr'){
        if(rawData.creditQr - 1 >= 0) status = true
    }else if(type == 'bio'){
        if(rawData.creditBioLink - 1 >= 0) status = true
    }else if(type == 'prompt'){
        if(rawData.creditPrompt - 1 >= 0) status = true
    }else if(type == 'bioPro'){
        if(rawData.creditBioPro - 1 >= 0) status = true
    }else {
        if(rawData.creditShortUrl - 1 >= 0) status = true 
    }
    return status 
}
export async function creditReduction(data) {  
    const {type, email} = data
    var status = false
    var oldData =  await(await db.collection('users').doc(email).get()).data()
    if(type == 'qr'){
        if(oldData.creditQr - 1 >= 0) oldData.creditQr -= 1
    }else if(type == 'bio'){
        if(oldData.creditBioLink - 1 >= 0) oldData.creditBioLink -= 1
    }else if(type == 'prompt'){
        if(oldData.creditPrompt - 1 >= 0) oldData.creditPrompt -= 1
    }else if(type == 'bioPro'){
        if(oldData.creditBioPro - 1 >= 0) oldData.creditBioPro -= 1
    }else {
        if(oldData.creditShortUrl - 1 >= 0) oldData.creditShortUrl -= 1
    }
    await db.collection('users').doc(email).set(oldData)
}

export function formatDate(dateString) {
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