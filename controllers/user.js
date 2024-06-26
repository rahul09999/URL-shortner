const USER = require('../models/user')
const { URL } = require('../models/url')
const { v4: uuidv4 } = require('uuid');
const {setUser, getUser} = require('../service/auth');


async function handleUserSignUp(req, res) {
    //Store body(data) coming from frontend
    const { name, email, password } = req.body;

    //Create Database
    await USER.create({
        name,
        email,
        password,
    });
    //const allUrls = await URL.find({})

    //render Home page, as new user signup
    return res.redirect('/');
}

async function handleUserLogin(req, res) {
    //Store body(data) coming from frontend
    const {email, password } = req.body;
    console.log("I am here in  handleUserLogin")
    const user = await USER.findOne({ email , password });

    //If not found then return it to login page
    if(!user){
        return res.render("login", {
            error:"Invalid email or password",
        });
    }

    //here comes when Login Details is right, create sessionid for user
    
    // const sessionid = uuidv4();
    // setUser(sessionid, user); //make map of sessionId and User
    // res.cookie("uid", sessionid);

    const token = setUser(user);
    console.log(token)
    res.cookie("token", token);
    //Redirect to Home page
    // return res.redirect('/');

    return res.redirect("/");
}

module.exports = {
    handleUserSignUp, handleUserLogin,
}