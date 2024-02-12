const express = require('express');
const router = express.Router();
const {handleGenerateNewShortUrl, handleAnalytics, handleUrlRedirect} = require('../controllers/url')

router.post('/', handleGenerateNewShortUrl); // /url initial route we get from index.js

router.get('/:shortId', handleUrlRedirect);

//Grab visitHistory.lenght and its array for total clicks and time of user visited that
router.get('/analytics/:id', handleAnalytics);

module.exports = router;