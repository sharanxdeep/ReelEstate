const express = require('express')
const router = express.Router()
const verifyToken = require('../../middleware/auth.middleware')
const {createListing} = require('./listings.controller')

router.post('/', verifyToken, createListing)

module.exports = router