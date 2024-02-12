//temp route (Not using currently)
const express = require('express');
const router = express.Router();
const {URL} = require('../models/url')


//Grab visitHistory.lenght and its array for total clicks and time of user visited that
// router.get('/analytics/:id', async (req, res) => {
//     const urlId = req.params.id;
//     const data = await URL.findOne()
// })