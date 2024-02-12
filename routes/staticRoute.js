//Here all UI related routes will be there-
const express = require('express');
const {URL} = require('../models/url')
const router = express.Router();

router.get('/', async (req, res) => {
    const allUrls = await URL.find({}) // its array of data(of collections of mongoDB)
    res.render('home', {
        urls : allUrls,
    });
})

module.exports = router;