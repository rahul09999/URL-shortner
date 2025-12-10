//Here all UI related routes will be there-
const express = require('express');
const {URL} = require('../models/url');
const { restrictTo } = require('../middlewares/middleAuth');
const { paginate } = require('../utils/pagination');
const USER = require('../models/user');
const router = express.Router();
const mongoose = require('mongoose');

async function getClickStats(matchFilter = {}) {
    try {
        const result = await URL.aggregate([
            { $match: matchFilter },
            { $project: { clicks: { $size: { $ifNull: ["$visitedHistory", []] } } } },
            { $group: { _id: null, totalClicks: { $sum: "$clicks" }, urlCount: { $sum: 1 } } }
        ]);

        const totalClicks = result[0]?.totalClicks || 0;
        const urlCount = result[0]?.urlCount || 0;
        const avgClicks = urlCount > 0 ? Math.round((totalClicks / urlCount) * 10) / 10 : 0;

        return { totalClicks, avgClicks };
    } catch (error) {
        console.error('Error calculating click stats:', error);
        return { totalClicks: 0, avgClicks: 0 };
    }
}

router.get('/admin/urls', restrictTo(["ADMIN"]) ,async (req, res) => {
    try {
        const { userId } = req.query;
        let matchFilter = {};
        let filteredUser = null;

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            const userObjectId = new mongoose.Types.ObjectId(userId);
            matchFilter = { createdBy: userObjectId };
            filteredUser = await USER.findById(userObjectId).select('name email').lean();
        }

        const { items: allUrls, pagination } = await paginate({
            query: URL.find(matchFilter).populate('createdBy', 'name email'),
            countQuery: URL.countDocuments(matchFilter),
            page: req.query.page,
            limit: req.query.limit
        });

        const { totalClicks, avgClicks } = await getClickStats(matchFilter);
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        return res.render('home', {
            urls: allUrls,
            BASE_URL: baseUrl,
            user: req.user,
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalUrls: pagination.totalItems,
            limit: pagination.itemsPerPage,
            adminView: true,
            filteredUserId: userId || null,
            filteredUser,
            totalClicks,
            avgClicks,
        });
    } catch (error) {
        console.error('Error fetching admin URLs:', error);
        return res.status(500).render('home', {
            urls: [],
            BASE_URL: process.env.BASE_URL || `${req.protocol}://${req.get('host')}`,
            user: req.user,
            error: "An error occurred while fetching URLs",
            currentPage: 1,
            totalPages: 1,
            totalUrls: 0,
            limit: 10,
            totalClicks: 0,
            avgClicks: 0,
            adminView: true,
            filteredUserId: null,
            filteredUser: null,
        });
    }
})

router.get('/', restrictTo(["NORMAL", "ADMIN"]) ,async (req, res) => {
    try {
        const userId = req.user._id instanceof mongoose.Types.ObjectId 
            ? req.user._id 
            : new mongoose.Types.ObjectId(req.user._id);
        
        const { items: allUrls, pagination } = await paginate({
            query: URL.find({ createdBy: userId }),
            countQuery: URL.countDocuments({ createdBy: userId }),
            page: req.query.page,
            limit: req.query.limit
        });

        const { totalClicks, avgClicks } = await getClickStats({ createdBy: userId });
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        return res.render('home', {
            urls: allUrls,
            BASE_URL: baseUrl,
            user: req.user,
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalUrls: pagination.totalItems,
            limit: pagination.itemsPerPage,
            adminView: false,
            totalClicks,
            avgClicks,
            id: req.query.id, // show newly created shortId after redirect
        });
    } catch (error) {
        console.error('Error fetching user URLs:', error);
        return res.status(500).render('home', {
            urls: [],
            BASE_URL: process.env.BASE_URL || `${req.protocol}://${req.get('host')}`,
            user: req.user,
            error: "An error occurred while fetching URLs",
            currentPage: 1,
            totalPages: 1,
            totalUrls: 0,
            limit: 10,
            totalClicks: 0,
            avgClicks: 0,
            adminView: false,
            filteredUserId: null,
            filteredUser: null,
        });
    }
})

router.get('/signup', async (req, res) => {
    return res.render('signup', {
        user: req.user
    });
})

router.get('/login', async (req, res) => {
    return res.render('login', {
        user: req.user
    });
})

module.exports = router;