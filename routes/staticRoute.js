//Here all UI related routes will be there-
const express = require('express');
const {URL} = require('../models/url');
const { restrictTo } = require('../middlewares/middleAuth');
const { paginate } = require('../utils/pagination');
const router = express.Router();


router.get('/admin/urls', restrictTo(["ADMIN"]) ,async (req, res) => {
    try {
        const { items: allUrls, pagination } = await paginate({
            query: URL.find({}),
            countQuery: URL.countDocuments({}),
            page: req.query.page,
            limit: req.query.limit
        });

        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        return res.render('home', {
            urls: allUrls,
            BASE_URL: baseUrl,
            user: req.user,
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalUrls: pagination.totalItems,
            limit: pagination.itemsPerPage
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
            limit: 10
        });
    }
})

router.get('/', restrictTo(["NORMAL", "ADMIN"]) ,async (req, res) => {
    try {
        const { items: allUrls, pagination } = await paginate({
            query: URL.find({ createdBy: req.user._id }),
            countQuery: URL.countDocuments({ createdBy: req.user._id }),
            page: req.query.page,
            limit: req.query.limit
        });

        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        return res.render('home', {
            urls: allUrls,
            BASE_URL: baseUrl,
            user: req.user,
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalUrls: pagination.totalItems,
            limit: pagination.itemsPerPage
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
            limit: 10
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