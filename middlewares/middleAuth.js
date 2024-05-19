const {getUser} = require('../service/auth');

async function restrictToLoggedinUserOnly(req, res, next){
    
   //Get UUID from cookies and if its not present then redirect to login page 
    const uuid = req.cookies.uid;
    if(!uuid) return res.redirect('/login');

    //Get user match with UUID and none user exist then redirect to login page
    const user = getUser(uuid);
    if(!user) return res.redirect('/login');
    
    //Pass user details to home page, /url route
    req.user = user;
    next();
}

module.exports = { restrictToLoggedinUserOnly }