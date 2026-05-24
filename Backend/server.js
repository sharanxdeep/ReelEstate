require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')

const app = express()

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const PORT = process.env.PORT

connectDB().then(()=>{
    app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})
})