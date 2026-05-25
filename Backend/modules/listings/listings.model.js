const mongoose = require('mongoose')

const listingSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    price: {
        type: Number,
        required: true,
    },

    houseNumber: {
        type: String,
        required: false,
    },

    street: {
        type: String,
        required: false,
    },

    locality: {
        type: String,
        required: false,
    },

    city: {
        type: String,
        required: true,
    },

    state: {
        type: String,
        required: true,
    },

    country: {
        type: String,
        required: true,
    },

    pincode: {
        type: String,
        required: false,
    },

    propertyType: {
        type: String,
        required: true,
        enum: ['apartment', 'villa', 'plot', 'commercial', 'farmhouse'],
    },

    size: {
        type: Number, // in sq ft
        required: false,
    },

    bedrooms: {
        type: Number,
        required: false,
    },

    bathrooms: {
        type: Number,
        required: false,
    },

    amenities: {
        type: [String],
        default: [],
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    status: {
        type : String,
        enum : ['draft', 'review', 'live', 'sold'],
        default : 'draft'
    },

    chapters: [
        {
            name: { type: String },
            videoUrl: { type: String },
            order: { type: Number, default: 0 }
        }
    ],
},
{timeStamps : true})

const listingModel = mongoose.model('Listing', listingSchema)

module.exports = listingModel