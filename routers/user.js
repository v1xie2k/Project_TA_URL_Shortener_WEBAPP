import express from 'express'
import session from 'express-session'
import { addNewUser, comparePassword, edituser } from '../functions/userController.js'
import { checkCredit, creditReduction, searchData } from '../functions/universal.js'
const router = express.Router()
import 'dotenv/config'

router.post('/register', async(req, res)=>{
    const data = req.body
    console.log(data);
    try{
        const result = await addNewUser(data).catch(console.dir);
        if(result){
            return res.status(200).send('success')
        }
        else{
            return res.status(400).send('error')
        }
    }catch(err){
        return res.status(400).send(err)
    }
})

router.post('/login', async(req, res)=>{
    const data = req.body
    try{
        const result = await searchData('users', data.email)
        if(result){
            const compareResult = await comparePassword(data.password, result.password)
            if(compareResult){
                req.session.user = {email: result.email, name: result.name, profile: result.profile, role: result.role}
                return res.status(200).send('success')
            }
            return res.status(400).send('error')
        }
        else{
            return res.status(400).send('error')
        }
    }catch(err){
        return res.status(400).send(err)
    }
})

router.post('/logout', async(req, res)=>{
    req.session.user = undefined
    return res.redirect('/login')
    
})

router.post('/updateUser', async(req, res)=>{
    const data = req.body
    await edituser(data)
    return res.redirect('/login')
    
})

router.post('/checkCredit', async(req, res)=>{
    const data = req.body
    data.email = req.session.user.email
    try{
        const result = await checkCredit(data)
        if(result){
            return res.status(200).send('success')
        }
        return res.status(400).send('error')
    }catch(err){
        console.log(err);
        return res.status(400).send(err)
    }
})

router.post('/reduceCredit', async(req, res)=>{
    const data = req.body
    data.email = req.session.user.email
    try{
        const result = await creditReduction(data)
        return res.status(200).send('success')
    }catch(err){
        console.log(err);
        return res.status(400).send(err)
    }
})


export default router