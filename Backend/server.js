require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
const authRouter = require('./modules/auth/auth.routes')
const cookieParser = require('cookie-parser')

const app = express()
const PORT = process.env.PORT

app.use(cookieParser())
app.use(express.json())

app.use('/api/auth', authRouter)


connectDB().then(()=>{
    app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})
})