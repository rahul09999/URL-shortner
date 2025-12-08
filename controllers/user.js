const USER = require('../models/user')
const { URL } = require('../models/url')
const { v4: uuidv4 } = require('uuid');
const {setUser, getUser} = require('../service/auth');


async function handleUserSignUp(req, res) {
    try {
        //Store body(data) coming from frontend
        const { name, email, password } = req.body;
        if(!name || !email || !password) {
            return res.render('signup', {
                error: "All fields are required",
                user: req.user
            });
        }
        //Check if user already exists
        const existingUser = await USER.findOne({ email });
        if(existingUser) {
            return res.render('signup', {
                error: "User with this email already exists",
                user: req.user
            });
        }

        //Create Database
        await USER.create({
            name,
            email,
            password,
        });
        //const allUrls = await URL.find({})

        //render Home page, as new user signup
        return res.redirect('/');
    } catch (error) {
        console.error('Error during user signup:', error);
        return res.render('signup', {
            error: "An error occurred during signup. Please try again.",
            user: req.user
        });
    }
}

async function handleUserLogin(req, res) {
    try {
        //Store body(data) coming from frontend
        const {email, password } = req.body;
        if(!email || !password) {
            return res.render("login", {
                error: "Email and password are required",
                user: req.user
            });
        }

        const user = await USER.findOne({ email , password });

        //If not found then return it to login page
        if(!user){
            return res.render("login", {
                error:"Invalid email or password",
                user: req.user
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
    } catch (error) {
        console.error('Error during user login:', error);
        return res.render("login", {
            error: "An error occurred during login. Please try again.",
            user: req.user
        });
    }
}

module.exports = {
    handleUserSignUp, handleUserLogin,
}