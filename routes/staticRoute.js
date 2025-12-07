//Here all UI related routes will be there-
const express = require('express');
const {URL} = require('../models/url');
const { restrictTo } = require('../middlewares/middleAuth');
const router = express.Router();


router.get('/admin/urls', restrictTo(["ADMIN"]) ,async (req, res) => {
    // if(!req.user) return res.redirect('/login')
    const allUrls = await URL.find({});
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    return res.render('home', {
        urls : allUrls,
        BASE_URL: baseUrl,
        user: req.user
    });
})

router.get('/', restrictTo(["NORMAL", "ADMIN"]) ,async (req, res) => {
    // if(!req.user) return res.redirect('/login')
    const allUrls = await URL.find({ createdBy: req.user._id }); // find({}) its array of data(of collections of mongoDB) and for find({ createdBy: req.user._id })->> it find only specific user created shortIds using their sessionId(UUID)
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    return res.render('home', {
        urls : allUrls,
        BASE_URL: baseUrl,
        user: req.user
    });
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