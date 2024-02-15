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