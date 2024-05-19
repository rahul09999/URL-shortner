// Here we Map key(sessionId) and Value(user details) Pairs
//Problem here is, if we restart the server then we need to create new cookies, as this code not store/map cookies in real-time in DB

const sessionidToUserMap = new Map();

function setUser(sessionid, user){
    sessionidToUserMap.set(sessionid, user);
}

function getUser(sessionid){
    return sessionidToUserMap.get(sessionid);
}

module.exports = {
    setUser,
    getUser
}