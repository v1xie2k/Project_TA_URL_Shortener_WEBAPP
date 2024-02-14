
// require('dotenv').config()

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const express = require('express');
const app = express() 
import express from 'express'
import pageRouter from './routers/page.js'
import urlRouter from './routers/url.js'

app.use(express.json());
app.use('/public', express.static('public'));
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))

app.use('/', pageRouter)
app.use('/api', urlRouter)


app.listen(process.env.PORT || 5000);