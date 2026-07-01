const express = require('express')
const router = express.Router()
const { register, login, getUser} = require('./auth.controller')

router.post('/register', register)
router.post('/login', login)
router.get('/:id', getUser)

router.get('/:id', async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id)
    if (!user) return res.status(404).json({ message: "User not found" })
    res.status(200).json({ user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router