const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
    {
        shortId: {
            type: String,
            required: true,
            unique: true,
        },
        redirectUrl: {
            type: String,
            required: true,
        },
        visitedHistory: [{
            timestamp: {
                type: Number,
            },
            ipAddress: {
                type: String, // Anonymized IP address
            },
            userAgent: {
                type: String,
            },
            referrer: {
                type: String,
            },
            location: {
                country: String,
                city: String,
                region: String,
            },
            deviceType: {
                type: String, // mobile, desktop, tablet, etc.
            },
            browserType: {
                type: String, // Chrome, Firefox, Safari, etc.
            },
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, //type is objectId that mongo creates
            ref: "users", //ref to user who created that shortId
        },
    
}, {timestamps: true} ); // it is mongoDB property which automatically add createdAt and updatedAt on our DataBase 

const URL = mongoose.model("url", urlSchema);

module.exports = { URL };