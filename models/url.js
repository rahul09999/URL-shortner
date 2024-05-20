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
            }
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, //type is objectId that mongo creates
            ref: "users", //ref to user who created that shortId
        },
    
}, {timestamps: true} ); // it is mongoDB property which automatically add createdAt and updatedAt on our DataBase 

const URL = mongoose.model("url", urlSchema);

module.exports = { URL };