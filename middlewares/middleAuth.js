const {getUser} = require('../service/auth');

async function checkForAuthentication(req, res, next){
    const tokenCookie = req.cookies?.token;

    req.user = null;
    if(!tokenCookie){
        return next();
    }

    //Validate authorization token
    const token = tokenCookie; 
    const user = getUser(token);
    req.user = user;
    next();
}

//It restrict user according to their roles to access specific page
function restrictTo(roles = []){
    return function(req, res, next){
        if(!req.user) return res.redirect("/login");
        if(!roles.includes(req.user.role)) return res.end("UnAuthorized to access this page");

        return next();
    };
}
module.exports = { checkForAuthentication, restrictTo }