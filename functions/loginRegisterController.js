import pkg from 'bcrypt'
import  { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore'
import '../config/firebase.js'
import 'dotenv/config'
import { searchData } from './universal.js';

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
            bcrypt.genSalt(10, async (err, salt) => {
                bcrypt.hash(data.password, salt, async function(err, hash) {
                    data.password = await hash
                    const res = await db.collection(dbName).doc(data.email).set(await data)
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
        if(data.credit) oldData.credit = data.credit
        if(data.name) oldData.name = data.name
        if(data.password) oldData.password = data.password
        const res = await db.collection(dbName).doc(data.email).set(oldData)
        return true
    }catch(err){
        console.log(err.stack);
        return false
    }
}