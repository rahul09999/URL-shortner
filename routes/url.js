const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {handleGenerateNewShortUrl, handleAnalytics, handleUrlRedirect, handleDeleteShortUrl} = require('../controllers/url')

// Rate limiting: max 25 links in 60 seconds
const createUrlLimiter = rateLimit({
    windowMs: 60 * 1000, // 60 seconds
    max: 25, // limit each IP to 25 requests per windowMs
    message: {
        error: 'Too many short URLs created, please try again after a minute.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post('/', createUrlLimiter, handleGenerateNewShortUrl); // /url initial route we get from index.js

router.get('/:shortId', handleUrlRedirect);

//Grab visitHistory.lenght and its array for total clicks and time of user visited that
router.get('/analytics/:id', handleAnalytics);

// Delete short URL route
router.delete('/:shortId', handleDeleteShortUrl);

module.exports = router;