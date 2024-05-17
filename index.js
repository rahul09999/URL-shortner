const express = require('express');
const app = express();
const { mongooseConnect } = require('./connect');
const { URL } = require('./models/url');
require('dotenv/config');
const mongo_connect = process.env.MONGO_CONNECT; //Add your own DB
const port = process.env.PORT || 3000;

//Routes
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRoute')
const userRoute = require('./routes/user');

//Mongo-Connection
mongooseConnect(`${mongo_connect}/url-shortner`)
.then(() => console.log("MongoDB is connected..."))
.catch((err) => {
    console.log(err);
})

app.set('port', port); // Set the port number as a property of the app object, can acces it anywhere with req.port
//register view engine(UI part)
app.set('view engine', 'ejs'); //by default express knows all UI component is present in views folder, so we dont need to explicity define it
//what if folder name is not view? Just Add below syntax
//app.set('views', path.resolve("./YourFolderName") // YourFolderName -> where ur UI stuffs there

app.use(express.json());
app.use(express.urlencoded({extended: true})); // This middleware help us to encode form data

//Route-middleware
app.use('/url', urlRoute);
app.use('/', staticRoute);
app.use('/user', userRoute);




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

//routes-
// Method- Post , route-> /url => to get shortid
// Method- Get, route-> /:shortUrl => to redirect to ur given link
// Method- Get, route-> /url/analytics/:id => to get analytics of ur shortUrl clicks

//To-do
//Make sure when you send url shortner link it should land on / route instead of /url
//And url generate link only while clicking on that button and not on refresh of page
//Auth-
//Schema, login/signup page and route -> Generate sessionUID -> store it in form of cookies -> check and give response according -> generate analytics for individually