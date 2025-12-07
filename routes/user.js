const express = require('express');
const router = express.Router();
const {handleUserSignUp, handleUserLogin} = require('../controllers/user');

//Post signup data to DB to render home page
router.post('/', handleUserSignUp);
router.post('/login', handleUserLogin);

// Logout route
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.redirect('/login');
});

module.exports = router;