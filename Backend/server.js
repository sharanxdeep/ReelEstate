require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const authRouter = require('./modules/auth/auth.routes')
const listingRouter = require('./modules/listings/listings.routes')
const cookieParser = require('cookie-parser')

const app = express()
const PORT = process.env.PORT

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/listings', listingRouter)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
})