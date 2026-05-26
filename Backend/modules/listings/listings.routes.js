const express = require('express')
const router = express.Router()
const verifyToken = require('../../middleware/auth.middleware')
const {createListing, getAllListings, getListing, deleteListing, updateListing} = require('./listings.controller')

router.post('/', verifyToken, createListing)
router.get('/', getAllListings)
router.get('/:id', getListing)
router.delete('/:id', verifyToken, deleteListing)
router.patch('/:id', verifyToken, updateListing)

module.exports = router