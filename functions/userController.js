import pkg from 'bcrypt'
import  { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore'
import '../config/firebase.js'
import 'dotenv/config'
import { formatDate, searchData } from './universal.js';

const bcrypt = pkg
const db = getFirestore();
const dbName = 'users'

export async function comparePassword(plaintextPassword, hash) {
    const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
}

export async function addNewUser(data) {
    try {
        
        if(await searchData(dbName, data.email)){
            // duplicate data found
            return false 
        }else{
            data.ban = -1
            bcrypt.genSalt(10, async (err, salt) => {
                bcrypt.hash(data.password, salt, async function(err, hash) {
                    data.password = await hash
                    await db.collection(dbName).doc(data.email).set(await data)
                });
            })
            return true
        }
    } catch (err) {
        console.log(err.stack);
        return false
    }
}

export async function edituser(data) {  
    try{
        var oldData = await searchData(dbName, data.email)
        if(data.updatedAt) oldData.updatedAt = data.updatedAt
        if(data.profile) oldData.profile = data.profile
        if(data.name) oldData.name = data.name
        if(data.password) oldData.password = data.password
        if(data.ban) oldData.ban = data.ban
        const res = await db.collection(dbName).doc(data.email).set(oldData)
        return true
    }catch(err){
        console.log(err.stack);
        return false
    }
}

export async function getUsers(email) {  
    var rawData
    var data = []
    try {
        rawData = await db.collection('users').get();
        rawData.forEach((doc) => {
            if(email != doc.data().user){
                const obj = doc.data()
                obj.dateCreated = formatDate(doc.data().createdAt)
                //dont push the admin that loggedin (email == admin that logged in into the system)
                data.push(obj)
            }
        })
    } catch (err) {
        console.log(err.stack);
    }
    return data
}