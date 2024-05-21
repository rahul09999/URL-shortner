// Here we Map key(sessionId) and Value(user details) Pairs
//Problem here is, if we restart the server then we need to create new cookies, as this code not store/map cookies in real-time in DB
// const sessionidToUserMap = new Map();

// function setUser(sessionid, user){
//     sessionidToUserMap.set(sessionid, user);
// }

// function getUser(sessionid){
//     return sessionidToUserMap.get(sessionid);
// }

const jwt = require('jsonwebtoken');
// const secretKey = "Ironfist@1234";
require('dotenv/config');
const secretKey = process.env.SECRET_KEY;


function setUser(user){
    const payload = {
        _id: user._id,
        email: user.email,
    }
    return jwt.sign(payload, secretKey)
}

function getUser(token){
    if(!token) return null;
    try {
        return jwt.verify(token, secretKey);
    } catch (err) {
        //console.error(err);
        // Handle the error here. You might want to return null, throw the error,
        return null;
    }
}

module.exports = {
    setUser,
    getUser
}