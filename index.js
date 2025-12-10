const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit');
const { mongooseConnect } = require('./connect');
const { URL } = require('./models/url');
require('dotenv/config');
const mongo_connect = process.env.MONGO_CONNECT; //Add your own DB
const port = process.env.PORT || 3000;

// Global rate limiter: 40 requests per minute per IP
const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 40, // limit each IP to 40 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again after a minute.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

//Routes
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRoute')
const userRoute = require('./routes/user');
// const {restrictToLoggedinUserOnly, checkBasicAth } = urequire('./middlewares/middleAuth'); //check For uuid, if not exist then redirect to login Page
const { checkForAuthentication, restrictTo } = require('./middlewares/middleAuth'); 

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

// 1 means "trust the first proxy hop". 
// This is perfect for Heroku, Vercel, Nginx, or local testing with headers.
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({extended: true})); // This middleware help us to encode form data
app.use(cookieParser());
app.use(express.static('public')); // Serve static files from public directory

// Apply general rate limiter to all routes
app.use(generalLimiter);

app.use(checkForAuthentication);

//Route-middleware
app.use('/url', restrictTo(["NORMAL", "ADMIN"]), urlRoute);
app.use('/', staticRoute);
app.use('/user', userRoute);




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
