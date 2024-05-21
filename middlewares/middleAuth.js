const {getUser} = require('../service/auth');

async function restrictToLoggedinUserOnly(req, res, next){
    
   //Get UUID from cookies and if its not present then redirect to login page 
    // const uuid = req.cookies.uid;

    //Get user match with UUID and none user exist then redirect to login page
    // const user = getUser(uuid);
    // if(!user) return res.redirect('/login');

    //Get Auth header's value where our token came in req
    const userUid = req.headers['authorization']
    if(!userUid) return res.redirect('/login');
    const token = userUid.split('Bearer ')[1]; //Auth: "Bearer <token>"  format of auth in headers

    const user = getUser(token);// sent to jwt.verify to get user data
    if(!user) return res.redirect('/login');
    
    //Pass user details to home page, /url route
    req.user = user;
    next();
}

async function checkBasicAuth(req, res, next){
    //use below while you using cookies
    // const uuid = req.cookies?.uid;
    // const user = getUser(uuid);

    //auth through headers
    const userUid = req.headers['authorization']
    const token = userUid.split('Bearer ')[1]; //Auth: "Bearer <token>"  format of auth in headers
    const user = getUser(token);




   
    req.user = user;
    next();
}

module.exports = { restrictToLoggedinUserOnly, checkBasicAuth }