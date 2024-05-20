const nanoid = require('nanoid');
const {URL} = require('../models/url');

async function handleGenerateNewShortUrl(req, res){

    //Check if URL provided or not
    const body = req.body;
    if(!body.url) return res.status(400).json({
        error: "Url is required",
    })

    //Create and Save shortID and URL in DB
    const shortId = nanoid.nanoid(8);
    await URL.create({
        shortId: shortId,
        redirectUrl: body.url,
        visitedHistory: [],
        createdBy: req.user._id, //user comes from ./middleware/auth.js which checks whether user login or not and _id is objectName used by mongo for each new db entries
    })

    //pass URL and shortID
    const allUrls = await URL.find({})
    return res.render('home', { // its goes to home page with property id(which will be in locals object) to render page with data
        id: shortId,
        urls: allUrls
    })
    // return res.json({
    //     id: shortId,
    // })
}

async function handleAnalytics(req, res){

    //Pass Analytics of shortID
    const shortId = req.params.id;
    const data = await URL.findOne({ shortId })
    res.json({
        totalClicks: data.visitedHistory.length,
        analytics: data.visitedHistory,
    })
}

//Whenever user goes to ShortId url, this function will be called
async function handleUrlRedirect(req, res){
    const shortId = req.params.shortId;
    console.log(shortId);

    //Get shortId and update visited history
    const entry = await URL.findOneAndUpdate(
        {
            shortId,
        },
        {
            $push: { // visitedHistory is array, so pushing new array on every click
                visitedHistory: {
                    timestamp: Date.now(),
                }
            }
        })
        console.log(entry);
        if(entry){
            res.redirect(entry.redirectUrl);
        }
        else{
            res.status(404).send('No entry found for the given URL');
        }

}


module.exports = { handleGenerateNewShortUrl, handleAnalytics, handleUrlRedirect }