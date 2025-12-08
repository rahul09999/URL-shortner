const nanoid = require('nanoid');
const {URL} = require('../models/url');
const { paginate } = require('../utils/pagination');

async function handleGenerateNewShortUrl(req, res){
    try {
        //Check if URL provided or not
        const body = req.body;
        if(!body.url) return res.status(400).json({
            error: "Url is required",
        })

        // Check if user has reached the maximum limit of 1000 links
        const userUrlCount = await URL.countDocuments({ createdBy: req.user._id });
        if(userUrlCount >= 1000) {
            return res.status(429).json({
                error: "Maximum limit reached. You can only create 1000 short links.",
            });
        }

        //Create and Save shortID and URL in DB
        const shortId = nanoid.nanoid(8);
        await URL.create({
            shortId: shortId,
            redirectUrl: body.url,
            visitedHistory: [],
            createdBy: req.user._id, //user comes from ./middleware/auth.js which checks whether user login or not and _id is objectName used by mongo for each new db entries
        })

        // Fetch URLs with pagination (first page, 10 per page), sorted by createdAt descending
        const { items: allUrls, pagination } = await paginate({
            query: URL.find({ createdBy: req.user._id }),
            countQuery: URL.countDocuments({ createdBy: req.user._id }),
            page: 1,
            limit: 10
        });

        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        return res.render('home', { // its goes to home page with property id(which will be in locals object) to render page with data
            id: shortId,
            urls: allUrls,
            BASE_URL: baseUrl,
            user: req.user,
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalUrls: pagination.totalItems,
            limit: pagination.itemsPerPage
        })
        // return res.json({
        //     id: shortId,
        // })
    } catch (error) {
        console.error('Error generating short URL:', error);
        return res.status(500).json({
            error: "Internal server error. Please try again later.",
        });
    }
}

async function handleAnalytics(req, res){
    try {
        //Pass Analytics of shortID
        const shortId = req.params.id;
        const data = await URL.findOne({ shortId })
        
        if(!data) {
            return res.status(404).json({
                error: "Short URL not found",
            });
        }

        res.json({
            totalClicks: data.visitedHistory.length,
            analytics: data.visitedHistory,
        })
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return res.status(500).json({
            error: "Internal server error. Please try again later.",
        });
    }
}

//Whenever user goes to ShortId url, this function will be called
async function handleUrlRedirect(req, res){
    try {
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
    } catch (error) {
        console.error('Error redirecting URL:', error);
        return res.status(500).send('Internal server error. Please try again later.');
    }
}


async function handleDeleteShortUrl(req, res){
    try {
        const shortId = req.params.shortId;
        
        // Find the URL and check if it belongs to the current user
        const urlEntry = await URL.findOne({ shortId });
        
        if(!urlEntry) {
            return res.status(404).json({
                error: "Short URL not found",
            });
        }
        if(urlEntry.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                error: "You don't have permission to delete this URL",
            });
        }

        // Delete the URL
        await URL.deleteOne({ shortId });

        return res.json({
            success: true,
            message: "Short URL deleted successfully",
        });
    } catch (error) {
        console.error('Error deleting short URL:', error);
        return res.status(500).json({
            error: "Internal server error. Please try again later.",
        });
    }
}

module.exports = { handleGenerateNewShortUrl, handleAnalytics, handleUrlRedirect, handleDeleteShortUrl }