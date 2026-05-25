const userModel = require('../modules/auth/User.model')
const jwt = require('jsonwebtoken')

const verifyToken = async (req,res,next)=>{
    try{
        const token = req.cookies.token
    if(!token) return res.status(401).json({message:"Session expired"})

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if(!decoded) return res.status(401).json({message:"Session expired"})
    
    const user = await userModel.findById(decoded.id)
    req.user = user
    next()
    }
    catch(error){
        return res.status(500).json({message:error.message})
    }
}

module.exports = verifyToken