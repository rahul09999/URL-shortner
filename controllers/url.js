const nanoid = require('nanoid');
const {URL} = require('../models/url');
const { paginate } = require('../utils/pagination');
const { parseUserAgent, getClientIP, getReferrer, getLocationFromIP } = require('../utils/analytics');

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

        const result = await URL.aggregate([
            { $match: { createdBy: req.user._id } },
            { $project: { clicks: { $size: { $ifNull: ["$visitedHistory", []] } } } },
            { $group: { _id: null, totalClicks: { $sum: "$clicks" }, urlCount: { $sum: 1 } } }
        ]);
        const totalClicks = result[0]?.totalClicks || 0;
        const avgClicks = pagination.totalItems > 0 ? Math.round((totalClicks / pagination.totalItems) * 10) / 10 : 0;

        // Redirect to dashboard with the new shortId
        return res.redirect(`/?id=${shortId}`);
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

        // Calculate analytics summary
        const analytics = data.visitedHistory || [];
        const deviceStats = {};
        const browserStats = {};
        const countryStats = {};
        const referrerStats = {};
        
        analytics.forEach(visit => {
            // Device statistics
            const device = visit.deviceType || 'Unknown';
            deviceStats[device] = (deviceStats[device] || 0) + 1;
            
            // Browser statistics
            const browser = visit.browserType || 'Unknown';
            browserStats[browser] = (browserStats[browser] || 0) + 1;
            
            // Country statistics
            const country = visit.location?.country || 'Unknown';
            countryStats[country] = (countryStats[country] || 0) + 1;
            
            // Referrer statistics
            const ref = visit.referrer || 'Direct';
            referrerStats[ref] = (referrerStats[ref] || 0) + 1;
        });

        res.json({
            totalClicks: analytics.length,
            analytics: analytics,
            summary: {
                deviceStats,
                browserStats,
                countryStats,
                referrerStats
            }
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

        // Collect analytics data
        const clientIP = getClientIP(req);
        const userAgent = req.headers['user-agent'] || '';
        const referrer = getReferrer(req);
        const { deviceType, browserType } = parseUserAgent(userAgent);
        
        // Get location (try to get it, but don't block redirect if it fails)
        let location = {
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown'
        };
        
        // Try to get location with a short timeout
        try {
            const locationPromise = getLocationFromIP(clientIP);
            const timeoutPromise = new Promise((resolve) => 
                setTimeout(() => resolve(location), 1000)
            );
            location = await Promise.race([locationPromise, timeoutPromise]);
        } catch (error) {
            // If location fetch fails, use default unknown location
            console.error('Error getting location:', error.message);
        }

        //Get shortId and update visited history with analytics data
        const timestamp = Date.now();
        const entry = await URL.findOneAndUpdate(
            {
                shortId,
            },
            {
                $push: { // visitedHistory is array, so pushing new array on every click
                    visitedHistory: {
                        timestamp: timestamp,
                        ipAddress: clientIP,
                        userAgent: userAgent,
                        referrer: referrer,
                        location: location,
                        deviceType: deviceType,
                        browserType: browserType,
                    }
                }
            })
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