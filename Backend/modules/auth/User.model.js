const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required : true,
        unique:false
    },
    role:{
        type:String,
        required : true,
        enum : ['user','admin'],
        default : 'user'
    },
    password:{
        type:String,
        required : true,
        unique : false
    },
    phone:{
        type: String,
        required:true,
        unique : false
    },
    savedProperties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing'
    }],
    avatar:{
        type: String,
        required: false,
        unique : false
    },
},
{timestamps : true}
)

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password ,12)
    next()
})

const userModel = mongoose.model('User' , userSchema)

module.exports = userModel