
const jwt = require('jsonwebtoken');
// const secretKey = "Ironfist@1234";
require('dotenv/config');
const secretKey = process.env.SECRET_KEY;


function setUser(user){
    const payload = {
        _id: user._id,
        email: user.email,
        role: user.role,
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