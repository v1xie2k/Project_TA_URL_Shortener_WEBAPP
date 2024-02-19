
// const { MongoClient, ServerApiVersion } = require('mongodb');
// const express = require('express');
const app = express() 
import express from 'express'
import sessions from 'express-session'
import cookieParser from 'cookie-parser'
import pageRouter from './routers/page.js'
import urlRouter from './routers/url.js'
import credentialRouter from './routers/user.js'

const oneDay = 1000 * 60 * 60 * 24;

app.use(sessions({
    secret: "pekora",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

app.use(cookieParser());

app.use(express.json());
app.use('/public', express.static('public'));
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))

app.use('/', pageRouter)
app.use('/api', urlRouter)
app.use('/credential', credentialRouter)


app.listen(8080);