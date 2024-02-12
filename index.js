const express = require('express');
const app = express();
const { mongooseConnect } = require('./connect');
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRoute')
const { URL } = require('./models/url');
require('dotenv/config');
const mongo_connect = process.env.MONGO_CONNECT;
const port = process.env.PORT || 3000;

mongooseConnect(`${mongo_connect}/url-shortner`)
.then(() => console.log("MongoDB is connected..."))
.catch((err) => {
    console.log(err);
})

app.set('port', port); // Set the port number as a property of the app object, can acces it anywhere with req.port
//register view engine(UI part)
app.set('view engine', 'ejs'); //by default express knows all UI component is present in views folder, so we dont need to explicity define it
//what if folder name is not view? Just Add below syntax
//app.set('views', 'YourFolderName') // YourFolderName -> where ur UI stuffs there

app.use(express.json());
app.use(express.urlencoded({extended: true})); // This middleware help us to encode form data


app.use('/url', urlRoute);
app.use('/', staticRoute);

// app.get('/url/:shortId', async (req, res) => {
//     const shortId = req.params.shortId;
//     console.log(shortId);
//     const entry = await URL.findOneAndUpdate(
//         {
//             shortId,
//         },
//         {
//             $push: { // visitedHistory is array, so pushing new array on every click
//                 visitedHistory: {
//                     timestamp: Date.now(),
//                 }
//             }
//         })
//         console.log(entry);
//         if(entry){
//             res.redirect(entry.redirectUrl);
//         }
//         else{
//             res.status(404).send('No entry found for the given URL');
//         }

// })


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

//routes-
// Method- Post , route-> /url => to get shortid
// Method- Get, route-> /:shortUrl => to redirect to ur given link
// Method- Get, route-> /url/analytics/:id => to get analytics of ur shortUrl clicks