const USER = require('../models/user')
const { URL } = require('../models/url')


async function handleUserSignUp(req, res) {
    //Store body(data) coming from frontent
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
    //Store body(data) coming from frontent
    const {email, password } = req.body;
    const user = await USER.findOne({ email , password });
    if(!user){
        return res.render("login", {
            error:"Invalid email or password",
        });
    }
    return res.redirect('/');
}

module.exports = {
    handleUserSignUp, handleUserLogin,
}