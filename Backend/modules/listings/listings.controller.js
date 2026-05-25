const listingModel = require('./listings.model')

const createListing = async (req,res)=>{
    try{
        const listing = await listingModel.create({
        ...req.body,
        seller:req.user._id
    })
    return res.status(201).json({message:"Listing Created"})
    }
    catch(error){
        return res.status(500).json({message:error.message})
    }
}

module.exports = { createListing }